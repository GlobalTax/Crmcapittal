-- Security Fix Migration: Phase 1 Critical Database Security (Fixed)
-- Fix 1: Add search_path to all existing functions for security
-- Fix 2: Update rate limiting with better security
-- Fix 3: Enhanced input validation and security monitoring

-- Update get_user_highest_role function with proper search path
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
  LIMIT 1
$$;

-- Update has_role_secure function with proper search path
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

-- Update the rate limiting function with better security and lower thresholds
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_max_requests integer DEFAULT 50, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_window timestamp with time zone;
  current_count integer;
  user_ip text;
BEGIN
  -- Get user IP for additional context
  user_ip := inet_client_addr()::text;
  
  -- Calculate current window start (truncated to the minute)
  current_window := date_trunc('minute', now() - (now()::time)::interval % (p_window_minutes || ' minutes')::interval);
  
  -- Enhanced identifier with IP for better tracking
  p_identifier := p_identifier || '_' || COALESCE(user_ip, 'unknown');
  
  -- Get or create current window count
  INSERT INTO public.rate_limits (identifier, window_start, request_count)
  VALUES (p_identifier, current_window, 1)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    created_at = now()
  RETURNING request_count INTO current_count;
  
  -- Log rate limit violations for security monitoring
  IF current_count > p_max_requests THEN
    PERFORM public.log_security_event(
      'rate_limit_exceeded',
      'high',
      'Rate limit exceeded for identifier: ' || p_identifier,
      jsonb_build_object(
        'identifier', p_identifier,
        'current_count', current_count,
        'max_requests', p_max_requests,
        'window_minutes', p_window_minutes,
        'user_ip', user_ip
      )
    );
  END IF;
  
  -- Clean up old windows (older than 24 hours)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Return true if under limit
  RETURN current_count <= p_max_requests;
END;
$$;

-- Create enhanced input validation function
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  p_input text,
  p_max_length integer DEFAULT 1000,
  p_allow_html boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $$
DECLARE
  sanitized_input text;
BEGIN
  -- Return null for null input
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check length first
  IF length(p_input) > p_max_length THEN
    RAISE EXCEPTION 'Input exceeds maximum length of % characters', p_max_length;
  END IF;
  
  -- Basic sanitization
  sanitized_input := p_input;
  
  -- Remove dangerous patterns
  sanitized_input := regexp_replace(sanitized_input, '<script[^>]*>.*?</script>', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, 'javascript:', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, 'vbscript:', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, 'on\w+\s*=', '', 'gi');
  
  -- Remove SQL injection patterns
  sanitized_input := regexp_replace(sanitized_input, '(union|select|insert|update|delete|drop|create|alter|exec|execute)\s', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  
  -- Remove HTML tags if not allowed
  IF NOT p_allow_html THEN
    sanitized_input := regexp_replace(sanitized_input, '<[^>]*>', '', 'g');
  END IF;
  
  -- Final cleanup
  sanitized_input := trim(sanitized_input);
  
  RETURN sanitized_input;
END;
$$;

-- Create secure email validation function
CREATE OR REPLACE FUNCTION public.validate_email_secure(p_email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic email pattern validation
  RETURN p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(p_email) <= 254
    AND p_email NOT LIKE '%..%'
    AND p_email NOT LIKE '.%'
    AND p_email NOT LIKE '%.'
    AND p_email NOT LIKE '%@.%'
    AND p_email NOT LIKE '%.@%';
END;
$$;

-- Enhanced security monitoring with automatic alerts
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_severity text DEFAULT 'medium',
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}',
  p_auto_alert boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
  user_email text;
  should_alert boolean := false;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
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
      'enhanced_logging', true
    ),
    auth.uid(),
    user_email,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  -- Determine if we should create an alert
  should_alert := p_auto_alert AND p_severity IN ('high', 'critical');
  
  -- Create security alert for critical events
  IF should_alert THEN
    INSERT INTO public.security_alerts (
      event_type,
      severity,
      title,
      description,
      metadata,
      triggered_by_log_id
    ) VALUES (
      p_event_type,
      p_severity,
      'Security Alert: ' || p_event_type,
      p_description,
      p_metadata,
      log_id
    );
  END IF;
  
  RETURN log_id;
END;
$$;

-- Create function to validate strong passwords
CREATE OR REPLACE FUNCTION public.validate_strong_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $$
BEGIN
  RETURN length(p_password) >= 8
    AND p_password ~ '[A-Z]'  -- at least one uppercase
    AND p_password ~ '[a-z]'  -- at least one lowercase  
    AND p_password ~ '[0-9]'  -- at least one digit
    AND p_password ~ '[^A-Za-z0-9]'; -- at least one special character
END;
$$;

-- Add session timeout function
CREATE OR REPLACE FUNCTION public.check_session_timeout(p_user_id uuid, p_timeout_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_activity timestamp with time zone;
BEGIN
  -- Check last activity from security logs
  SELECT MAX(created_at) INTO last_activity
  FROM public.security_logs
  WHERE user_id = p_user_id
  AND created_at > now() - interval '24 hours';
  
  -- If no recent activity or activity is older than timeout, session is expired
  IF last_activity IS NULL OR last_activity < now() - (p_timeout_minutes || ' minutes')::interval THEN
    -- Log session timeout
    PERFORM public.log_security_event_enhanced(
      'session_timeout',
      'medium',
      'User session timed out due to inactivity',
      jsonb_build_object(
        'timeout_minutes', p_timeout_minutes,
        'last_activity', last_activity
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add RLS policy for winback_sequences if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'winback_sequences' 
    AND policyname = 'Users can manage their own winback sequences'
  ) THEN
    CREATE POLICY "Users can manage their own winback sequences"
    ON public.winback_sequences
    FOR ALL
    USING (auth.uid() = created_by);
  END IF;
END $$;

-- Add RLS policy for winback_attempts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'winback_attempts' 
    AND policyname = 'Users can view winback attempts for their sequences'
  ) THEN
    CREATE POLICY "Users can view winback attempts for their sequences"
    ON public.winback_attempts
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.winback_sequences ws
      WHERE ws.id = winback_attempts.sequence_id
      AND ws.created_by = auth.uid()
    ));
  END IF;
END $$;