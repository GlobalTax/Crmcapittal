-- Critical Security Fixes - Phase 1 (Fixed)
-- Handle existing NULL values before making columns NOT NULL

-- First, set a default system user for existing NULL values
-- We'll use a special system UUID for records that don't have a created_by
DO $$
DECLARE
    system_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Update all NULL created_by values to system user
    UPDATE public.companies SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.contacts SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.deals SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.operations SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.leads SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.buying_mandates SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.cases SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.collaborators SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.commission_rules SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.communication_templates SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.proposals SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.valoraciones SET created_by = system_user_id WHERE created_by IS NULL;
    UPDATE public.reconversiones_new SET created_by = system_user_id WHERE created_by IS NULL;
END $$;

-- Now make the columns NOT NULL
ALTER TABLE public.companies ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.contacts ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.deals ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.operations ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.buying_mandates ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.cases ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.collaborators ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.commission_rules ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.communication_templates ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.proposals ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.valoraciones ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.reconversiones_new ALTER COLUMN created_by SET NOT NULL;

-- Create enhanced input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_form_input(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN '';
  END IF;

  input_text := trim(input_text);
  
  IF length(input_text) > max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', max_length;
  END IF;
  
  -- Remove dangerous SQL patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute|script)(\s|$|;)' THEN
    RAISE EXCEPTION 'Input contains dangerous SQL patterns';
  END IF;
  
  -- Remove XSS patterns
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  input_text := regexp_replace(input_text, '<[^>]*>', '', 'g');
  
  RETURN input_text;
END;
$$;

-- Create enhanced security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_severity text DEFAULT 'medium',
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
  user_email text;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Insert security log with enhanced metadata
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
      'function_called', 'log_security_event_enhanced'
    ),
    auth.uid(),
    user_email,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  -- Alert on critical events
  IF p_severity = 'critical' THEN
    RAISE WARNING 'CRITICAL SECURITY EVENT: % - %', p_event_type, p_description;
  END IF;
  
  RETURN log_id;
END;
$$;

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_count integer;
BEGIN
  SELECT COUNT(*)
  INTO request_count
  FROM public.security_logs
  WHERE metadata->>'rate_limit_key' = p_identifier
    AND created_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata
  ) VALUES (
    'rate_limit_check',
    'low',
    'Rate limit check performed',
    jsonb_build_object(
      'rate_limit_key', p_identifier,
      'current_count', request_count,
      'max_requests', p_max_requests
    )
  );
  
  RETURN request_count < p_max_requests;
END;
$$;

-- Log the security update
SELECT log_security_event_enhanced(
  'critical_security_fixes_applied',
  'high',
  'Critical security fixes applied: nullable user fields fixed, enhanced functions created',
  jsonb_build_object(
    'fix_type', 'nullable_columns_secured',
    'affected_tables', 13,
    'functions_created', 3
  )
);