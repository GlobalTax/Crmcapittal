-- Security Fixes - Phase 1: Critical Database Security
-- Fix Security Definer Views and Functions

-- 1. Replace security definer views with proper RLS enforcement
-- Drop the problematic security definer views
DROP VIEW IF EXISTS auth_users_view CASCADE;

-- 2. Fix function search paths for all security functions
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

-- 3. Enhanced rate limiting with proper search path
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_identifier text,
  p_operation text,
  p_max_requests integer DEFAULT 10,
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
  remaining_requests integer;
  reset_time timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  reset_time := now() + (p_window_minutes || ' minutes')::interval;
  
  -- Clean old entries
  DELETE FROM public.security_logs 
  WHERE event_type = 'rate_limit_check' 
    AND created_at < window_start;
  
  -- Count current requests
  SELECT COUNT(*) INTO current_count
  FROM public.security_logs
  WHERE event_type = 'rate_limit_check'
    AND metadata->>'identifier' = p_identifier
    AND metadata->>'operation' = p_operation
    AND created_at >= window_start;
  
  remaining_requests := p_max_requests - current_count;
  
  -- Log this check
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id
  ) VALUES (
    'rate_limit_check',
    'low',
    'Rate limit check for ' || p_operation,
    jsonb_build_object(
      'identifier', p_identifier,
      'operation', p_operation,
      'current_count', current_count,
      'max_requests', p_max_requests,
      'window_minutes', p_window_minutes
    ),
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'allowed', remaining_requests > 0,
    'remaining', GREATEST(0, remaining_requests),
    'reset_time', reset_time,
    'current_count', current_count
  );
END;
$$;

-- 4. Strong password validation function
CREATE OR REPLACE FUNCTION public.validate_strong_password(p_password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  errors text[] := '{}';
  score integer := 0;
BEGIN
  -- Length check
  IF length(p_password) < 8 THEN
    errors := array_append(errors, 'La contraseña debe tener al menos 8 caracteres');
  ELSE
    score := score + 1;
  END IF;
  
  -- Uppercase check
  IF p_password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Debe contener al menos una letra mayúscula');
  ELSE
    score := score + 1;
  END IF;
  
  -- Lowercase check
  IF p_password !~ '[a-z]' THEN
    errors := array_append(errors, 'Debe contener al menos una letra minúscula');
  ELSE
    score := score + 1;
  END IF;
  
  -- Number check
  IF p_password !~ '[0-9]' THEN
    errors := array_append(errors, 'Debe contener al menos un número');
  ELSE
    score := score + 1;
  END IF;
  
  -- Special character check
  IF p_password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Debe contener al menos un carácter especial');
  ELSE
    score := score + 1;
  END IF;
  
  -- Common password patterns
  IF p_password ~* '(password|123456|qwerty|admin|user)' THEN
    errors := array_append(errors, 'No se permiten contraseñas comunes');
    score := score - 2;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'score', GREATEST(0, score),
    'strength', CASE 
      WHEN score >= 5 THEN 'strong'
      WHEN score >= 3 THEN 'medium'
      ELSE 'weak'
    END
  );
END;
$$;

-- 5. Enhanced session timeout checking
CREATE OR REPLACE FUNCTION public.check_session_timeout_enhanced(
  p_session_id text,
  p_timeout_minutes integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_activity timestamp with time zone;
  is_expired boolean;
  remaining_minutes integer;
BEGIN
  -- Get last activity from security logs
  SELECT MAX(created_at) INTO last_activity
  FROM public.security_logs
  WHERE user_id = auth.uid()
    AND event_type NOT IN ('session_timeout_check', 'rate_limit_check');
  
  -- If no activity found, use current time
  IF last_activity IS NULL THEN
    last_activity := now();
  END IF;
  
  -- Check if session has expired
  is_expired := (now() - last_activity) > (p_timeout_minutes || ' minutes')::interval;
  
  -- Calculate remaining time
  remaining_minutes := GREATEST(0, 
    p_timeout_minutes - EXTRACT(MINUTES FROM now() - last_activity)::integer
  );
  
  -- Log session check
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id
  ) VALUES (
    'session_timeout_check',
    CASE WHEN is_expired THEN 'medium' ELSE 'low' END,
    'Session timeout check',
    jsonb_build_object(
      'session_id', p_session_id,
      'last_activity', last_activity,
      'is_expired', is_expired,
      'remaining_minutes', remaining_minutes,
      'timeout_minutes', p_timeout_minutes
    ),
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'is_expired', is_expired,
    'last_activity', last_activity,
    'remaining_minutes', remaining_minutes,
    'should_warn', remaining_minutes <= 5 AND remaining_minutes > 0
  );
END;
$$;

-- 6. File upload security validation
CREATE OR REPLACE FUNCTION public.validate_file_upload_security(
  p_filename text,
  p_file_size bigint,
  p_mime_type text,
  p_max_size_mb integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  allowed_types text[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  dangerous_extensions text[] := ARRAY[
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'asp', 'aspx', 'php', 'jsp', 'sh', 'py', 'rb', 'pl'
  ];
  file_extension text;
  errors text[] := '{}';
  max_size_bytes bigint;
BEGIN
  max_size_bytes := p_max_size_mb * 1024 * 1024;
  
  -- Extract file extension
  file_extension := lower(split_part(p_filename, '.', array_length(string_to_array(p_filename, '.'), 1)));
  
  -- Size validation
  IF p_file_size > max_size_bytes THEN
    errors := array_append(errors, 'Archivo demasiado grande. Máximo ' || p_max_size_mb || 'MB');
  END IF;
  
  -- MIME type validation
  IF p_mime_type != ALL(allowed_types) THEN
    errors := array_append(errors, 'Tipo de archivo no permitido: ' || p_mime_type);
  END IF;
  
  -- Dangerous extension check
  IF file_extension = ANY(dangerous_extensions) THEN
    errors := array_append(errors, 'Extensión de archivo peligrosa: ' || file_extension);
  END IF;
  
  -- Filename security checks
  IF p_filename ~ '\.\.' OR p_filename ~ '/' OR p_filename ~ '\\' THEN
    errors := array_append(errors, 'Nombre de archivo contiene caracteres peligrosos');
  END IF;
  
  -- Null byte injection check
  IF position(E'\\000' in p_filename) > 0 THEN
    errors := array_append(errors, 'Nombre de archivo contiene bytes nulos');
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'file_extension', file_extension,
    'size_mb', round((p_file_size::numeric / 1024 / 1024)::numeric, 2)
  );
END;
$$;