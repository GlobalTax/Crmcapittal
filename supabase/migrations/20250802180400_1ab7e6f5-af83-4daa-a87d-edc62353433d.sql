-- Phase 1: Critical Database Security Fixes

-- 1. Fix Security Definer Views - Replace problematic views with secure alternatives
-- Drop existing problematic views and recreate with proper RLS enforcement

-- Fix auth user view security
DROP VIEW IF EXISTS auth_users_view;
CREATE VIEW auth_users_view AS 
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  CASE 
    WHEN auth.uid() = au.id OR has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin') 
    THEN au.email_confirmed_at 
    ELSE NULL 
  END as email_confirmed_at
FROM auth.users au
WHERE auth.uid() = au.id 
   OR has_role_secure(auth.uid(), 'admin') 
   OR has_role_secure(auth.uid(), 'superadmin');

-- 2. Update all database functions to include proper search_path
-- This prevents schema poisoning attacks

CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- 3. Enhanced rate limiting with lower thresholds and better security
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_identifier text,
  p_operation text,
  p_max_requests integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
  is_blocked boolean := false;
  remaining_attempts integer;
  reset_time timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in current window
  SELECT COUNT(*) INTO current_count
  FROM security_logs
  WHERE metadata->>'rate_limit_identifier' = p_identifier
    AND metadata->>'operation' = p_operation
    AND created_at >= window_start;
  
  -- Check if blocked
  is_blocked := current_count >= p_max_requests;
  remaining_attempts := GREATEST(0, p_max_requests - current_count);
  reset_time := now() + (p_window_minutes || ' minutes')::interval;
  
  -- Log the rate limit check
  INSERT INTO security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'rate_limit_check',
    CASE WHEN is_blocked THEN 'high' ELSE 'low' END,
    'Rate limit check for operation: ' || p_operation,
    jsonb_build_object(
      'rate_limit_identifier', p_identifier,
      'operation', p_operation,
      'current_count', current_count,
      'max_requests', p_max_requests,
      'window_minutes', p_window_minutes,
      'is_blocked', is_blocked,
      'remaining_attempts', remaining_attempts
    ),
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN jsonb_build_object(
    'allowed', NOT is_blocked,
    'remaining_attempts', remaining_attempts,
    'reset_time', reset_time,
    'current_count', current_count
  );
END;
$$;

-- 4. Enhanced password validation with better security requirements
CREATE OR REPLACE FUNCTION public.validate_strong_password(p_password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  errors text[] := '{}';
  score integer := 0;
BEGIN
  -- Length check (minimum 12 characters)
  IF length(p_password) < 12 THEN
    errors := array_append(errors, 'La contraseña debe tener al menos 12 caracteres');
  ELSE
    score := score + 20;
  END IF;
  
  -- Uppercase check
  IF p_password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Debe contener al menos una letra mayúscula');
  ELSE
    score := score + 15;
  END IF;
  
  -- Lowercase check
  IF p_password !~ '[a-z]' THEN
    errors := array_append(errors, 'Debe contener al menos una letra minúscula');
  ELSE
    score := score + 15;
  END IF;
  
  -- Number check
  IF p_password !~ '[0-9]' THEN
    errors := array_append(errors, 'Debe contener al menos un número');
  ELSE
    score := score + 15;
  END IF;
  
  -- Special character check
  IF p_password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Debe contener al menos un carácter especial');
  ELSE
    score := score + 15;
  END IF;
  
  -- No common patterns
  IF p_password ~* '(password|123456|qwerty|admin|user)' THEN
    errors := array_append(errors, 'No debe contener patrones comunes');
    score := score - 10;
  END IF;
  
  -- Bonus for length
  IF length(p_password) >= 16 THEN
    score := score + 10;
  END IF;
  
  -- Bonus for complexity
  IF p_password ~ '[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]' THEN
    score := score + 10;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'score', GREATEST(0, LEAST(100, score)),
    'strength', CASE 
      WHEN score >= 80 THEN 'very_strong'
      WHEN score >= 60 THEN 'strong'
      WHEN score >= 40 THEN 'medium'
      WHEN score >= 20 THEN 'weak'
      ELSE 'very_weak'
    END
  );
END;
$$;

-- 5. Enhanced session timeout checking
CREATE OR REPLACE FUNCTION public.check_session_timeout_enhanced(
  p_session_timeout_minutes integer DEFAULT 30,
  p_warning_minutes integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_activity timestamp with time zone;
  session_expires_at timestamp with time zone;
  warning_time timestamp with time zone;
  is_expired boolean;
  show_warning boolean;
  minutes_remaining integer;
BEGIN
  -- Get user's last activity from security logs
  SELECT MAX(created_at) INTO last_activity
  FROM security_logs
  WHERE user_id = auth.uid()
    AND created_at >= now() - (p_session_timeout_minutes || ' minutes')::interval;
  
  -- If no recent activity, use current time
  IF last_activity IS NULL THEN
    last_activity := now();
  END IF;
  
  session_expires_at := last_activity + (p_session_timeout_minutes || ' minutes')::interval;
  warning_time := session_expires_at - (p_warning_minutes || ' minutes')::interval;
  
  is_expired := now() >= session_expires_at;
  show_warning := now() >= warning_time AND NOT is_expired;
  minutes_remaining := EXTRACT(EPOCH FROM (session_expires_at - now())) / 60;
  
  -- Log session check
  INSERT INTO security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'session_timeout_check',
    CASE WHEN is_expired THEN 'medium' WHEN show_warning THEN 'low' ELSE 'info' END,
    'Session timeout check performed',
    jsonb_build_object(
      'last_activity', last_activity,
      'session_expires_at', session_expires_at,
      'is_expired', is_expired,
      'show_warning', show_warning,
      'minutes_remaining', minutes_remaining
    ),
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN jsonb_build_object(
    'is_expired', is_expired,
    'show_warning', show_warning,
    'minutes_remaining', GREATEST(0, minutes_remaining::integer),
    'last_activity', last_activity,
    'expires_at', session_expires_at
  );
END;
$$;

-- 6. Create automated security alert function
CREATE OR REPLACE FUNCTION public.create_security_alert(
  p_alert_type text,
  p_severity text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id uuid;
BEGIN
  -- Insert into security_logs with special alert flag
  INSERT INTO security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'security_alert_' || p_alert_type,
    p_severity,
    p_message,
    p_metadata || jsonb_build_object(
      'is_alert', true,
      'alert_type', p_alert_type,
      'requires_attention', true,
      'auto_generated', true
    ),
    auth.uid(),
    inet_client_addr()
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- 7. Add improved file upload security validation
CREATE OR REPLACE FUNCTION public.validate_file_upload_security(
  p_filename text,
  p_content_type text,
  p_file_size bigint,
  p_max_size_mb integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  errors text[] := '{}';
  sanitized_filename text;
  allowed_types text[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  dangerous_extensions text[] := ARRAY[
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1'
  ];
  ext text;
BEGIN
  -- File size check
  IF p_file_size > (p_max_size_mb * 1024 * 1024) THEN
    errors := array_append(errors, 'El archivo excede el tamaño máximo de ' || p_max_size_mb || 'MB');
  END IF;
  
  -- Content type validation
  IF p_content_type != ALL(allowed_types) THEN
    errors := array_append(errors, 'Tipo de archivo no permitido: ' || p_content_type);
  END IF;
  
  -- Filename sanitization and validation
  sanitized_filename := regexp_replace(p_filename, '[<>:"/\\|?*]', '', 'g');
  sanitized_filename := regexp_replace(sanitized_filename, '\.{2,}', '.', 'g');
  sanitized_filename := trim(sanitized_filename);
  
  -- Check for dangerous extensions
  ext := lower(substring(p_filename from '\.([^.]*)$'));
  IF ('.' || ext) = ANY(dangerous_extensions) THEN
    errors := array_append(errors, 'Extensión de archivo peligrosa: ' || ext);
  END IF;
  
  -- Check for suspicious patterns
  IF p_filename ~* '(script|javascript|vbscript|onload|onerror)' THEN
    errors := array_append(errors, 'Nombre de archivo contiene patrones sospechosos');
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'sanitized_filename', sanitized_filename,
    'detected_type', p_content_type
  );
END;
$$;

-- 8. Update existing log_security_event_enhanced to include automated alerting
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_severity text DEFAULT 'medium',
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}',
  p_user_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
  current_user_email text;
  should_alert boolean := false;
BEGIN
  -- Get user email if not provided
  IF p_user_email IS NULL THEN
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();
  ELSE
    current_user_email := p_user_email;
  END IF;
  
  -- Determine if this event should trigger an alert
  should_alert := p_severity IN ('high', 'critical') OR 
                  p_event_type IN ('unauthorized_access', 'privilege_escalation_attempt', 
                                   'failed_login', 'suspicious_activity', 'potential_data_exfiltration');
  
  -- Insert enhanced security log
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    user_email,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata || jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers::json->user-agent', true),
      'session_id', current_setting('request.jwt.claims::json->session_id', true),
      'requires_alert', should_alert,
      'auto_logged', true
    ),
    auth.uid(),
    current_user_email,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  -- Create security alert if needed
  IF should_alert THEN
    PERFORM create_security_alert(
      p_event_type,
      p_severity,
      'Evento de seguridad crítico: ' || p_description,
      p_metadata || jsonb_build_object(
        'original_log_id', log_id,
        'user_email', current_user_email
      )
    );
  END IF;
  
  RETURN log_id;
END;
$$;