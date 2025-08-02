-- Phase 1: Critical Database Security Fixes

-- 1. Drop problematic security definer views that bypass RLS
DROP VIEW IF EXISTS auth_users_view CASCADE;

-- 2. Fix function search paths to prevent schema poisoning
-- Update has_role_secure function
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

-- Update get_user_highest_role function  
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

-- 3. Create enhanced rate limiting function with better security
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_identifier text,
  p_operation text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_attempts integer := 0;
  window_start timestamp with time zone;
  is_blocked boolean := false;
  reset_time timestamp with time zone;
BEGIN
  -- Calculate window start time
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count attempts in current window
  SELECT COUNT(*) INTO current_attempts
  FROM public.security_logs
  WHERE event_type = 'rate_limit_check'
    AND metadata->>'identifier' = p_identifier
    AND metadata->>'operation' = p_operation
    AND timestamp >= window_start;
  
  -- Check if blocked
  is_blocked := current_attempts >= p_max_attempts;
  reset_time := window_start + (p_window_minutes || ' minutes')::interval;
  
  -- Log this rate limit check
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'rate_limit_check',
    CASE WHEN is_blocked THEN 'high' ELSE 'low' END,
    CASE WHEN is_blocked THEN 'Rate limit exceeded' ELSE 'Rate limit check' END,
    jsonb_build_object(
      'identifier', p_identifier,
      'operation', p_operation,
      'current_attempts', current_attempts,
      'max_attempts', p_max_attempts,
      'window_minutes', p_window_minutes,
      'blocked', is_blocked
    ),
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN jsonb_build_object(
    'allowed', NOT is_blocked,
    'current_attempts', current_attempts,
    'max_attempts', p_max_attempts,
    'reset_time', extract(epoch from reset_time),
    'blocked', is_blocked
  );
END;
$$;

-- 4. Create strong password validation function
CREATE OR REPLACE FUNCTION public.validate_strong_password(p_password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  errors text[] := '{}';
  strength_score integer := 0;
BEGIN
  -- Check minimum length
  IF length(p_password) < 12 THEN
    errors := array_append(errors, 'Password must be at least 12 characters long');
  ELSE
    strength_score := strength_score + 2;
  END IF;
  
  -- Check for uppercase letter
  IF p_password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  ELSE
    strength_score := strength_score + 1;
  END IF;
  
  -- Check for lowercase letter
  IF p_password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  ELSE
    strength_score := strength_score + 1;
  END IF;
  
  -- Check for number
  IF p_password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  ELSE
    strength_score := strength_score + 1;
  END IF;
  
  -- Check for special character
  IF p_password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  ELSE
    strength_score := strength_score + 2;
  END IF;
  
  -- Check for common patterns
  IF p_password ~* '(password|123456|qwerty|admin|user)' THEN
    errors := array_append(errors, 'Password contains common patterns that are not allowed');
    strength_score := strength_score - 2;
  END IF;
  
  -- Check for repetitive characters
  IF p_password ~ '(.)\1{2,}' THEN
    errors := array_append(errors, 'Password should not contain repetitive characters');
    strength_score := strength_score - 1;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'strength_score', GREATEST(0, strength_score),
    'strength_level', 
      CASE 
        WHEN strength_score >= 6 THEN 'strong'
        WHEN strength_score >= 4 THEN 'medium'
        ELSE 'weak'
      END
  );
END;
$$;

-- 5. Create session timeout validation function
CREATE OR REPLACE FUNCTION public.check_session_timeout_enhanced(
  p_user_id uuid,
  p_last_activity timestamp with time zone DEFAULT NULL,
  p_timeout_minutes integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_activity timestamp with time zone;
  is_expired boolean := false;
  time_remaining interval;
BEGIN
  -- Use provided last_activity or get from auth session
  IF p_last_activity IS NULL THEN
    -- In a real implementation, you'd get this from auth session
    last_activity := now() - interval '5 minutes'; -- placeholder
  ELSE
    last_activity := p_last_activity;
  END IF;
  
  -- Check if session has expired
  is_expired := (now() - last_activity) > (p_timeout_minutes || ' minutes')::interval;
  
  -- Calculate time remaining
  IF NOT is_expired THEN
    time_remaining := (last_activity + (p_timeout_minutes || ' minutes')::interval) - now();
  ELSE
    time_remaining := interval '0';
  END IF;
  
  -- Log session check
  PERFORM public.log_security_event(
    'session_timeout_check',
    CASE WHEN is_expired THEN 'medium' ELSE 'low' END,
    CASE WHEN is_expired THEN 'Session expired' ELSE 'Session timeout check' END,
    jsonb_build_object(
      'user_id', p_user_id,
      'last_activity', last_activity,
      'timeout_minutes', p_timeout_minutes,
      'is_expired', is_expired,
      'time_remaining_seconds', extract(epoch from time_remaining)
    )
  );
  
  RETURN jsonb_build_object(
    'is_expired', is_expired,
    'last_activity', last_activity,
    'timeout_minutes', p_timeout_minutes,
    'time_remaining_seconds', extract(epoch from time_remaining),
    'expires_at', last_activity + (p_timeout_minutes || ' minutes')::interval
  );
END;
$$;

-- 6. Create enhanced file upload security validation
CREATE OR REPLACE FUNCTION public.validate_file_upload_security(
  p_filename text,
  p_content_type text,
  p_file_size bigint,
  p_upload_context text DEFAULT 'general'
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  errors text[] := '{}';
  warnings text[] := '{}';
  max_size bigint;
  allowed_types text[];
  sanitized_filename text;
BEGIN
  -- Set context-specific limits
  CASE p_upload_context
    WHEN 'avatar' THEN
      max_size := 5 * 1024 * 1024; -- 5MB
      allowed_types := ARRAY['image/jpeg', 'image/png', 'image/webp'];
    WHEN 'document' THEN
      max_size := 25 * 1024 * 1024; -- 25MB
      allowed_types := ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    ELSE
      max_size := 10 * 1024 * 1024; -- 10MB default
      allowed_types := ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
  END CASE;
  
  -- Validate file size
  IF p_file_size > max_size THEN
    errors := array_append(errors, 'File size exceeds maximum allowed size of ' || (max_size / 1024 / 1024) || 'MB');
  END IF;
  
  -- Validate content type
  IF NOT (p_content_type = ANY(allowed_types)) THEN
    errors := array_append(errors, 'File type not allowed. Allowed types: ' || array_to_string(allowed_types, ', '));
  END IF;
  
  -- Sanitize filename
  sanitized_filename := regexp_replace(p_filename, '[^a-zA-Z0-9._-]', '_', 'g');
  sanitized_filename := regexp_replace(sanitized_filename, '_{2,}', '_', 'g');
  sanitized_filename := trim(sanitized_filename, '_');
  
  -- Check for suspicious filename patterns
  IF p_filename ~* '\.(exe|bat|cmd|scr|pif|com|dll|jar|sh|php|asp|jsp)$' THEN
    errors := array_append(errors, 'Executable file types are not allowed');
  END IF;
  
  -- Check for path traversal attempts
  IF p_filename ~ '\.\.|/' THEN
    errors := array_append(errors, 'Invalid filename: path traversal detected');
  END IF;
  
  -- Check filename length
  IF length(p_filename) > 255 THEN
    errors := array_append(errors, 'Filename too long (maximum 255 characters)');
  END IF;
  
  -- Check for hidden files
  IF p_filename ~ '^\.' THEN
    warnings := array_append(warnings, 'Hidden file detected');
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'warnings', warnings,
    'sanitized_filename', sanitized_filename,
    'max_size_bytes', max_size,
    'allowed_types', allowed_types
  );
END;
$$;

-- 7. Update existing security functions to use proper search_path
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_severity text DEFAULT 'medium'::text,
  p_description text DEFAULT ''::text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_user_email text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    log_id uuid;
    current_user_email text;
BEGIN
    -- Get user email if not provided
    IF p_user_email IS NULL THEN
        SELECT email INTO current_user_email
        FROM auth.users
        WHERE id = auth.uid();
    ELSE
        current_user_email := p_user_email;
    END IF;
    
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
            'session_id', current_setting('request.jwt.claims::json->session_id', true)
        ),
        auth.uid(),
        current_user_email,
        inet_client_addr()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;