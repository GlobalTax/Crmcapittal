-- Critical Security Fixes - Phase 1
-- Fix nullable user fields used in RLS policies to prevent access control bypass

-- 1. Fix Security Definer Views by dropping and recreating them as regular views
-- Note: These views need to be identified and recreated without SECURITY DEFINER

-- 2. Fix nullable created_by/user_id fields that are used in RLS policies
-- These fields MUST NOT be nullable when used in RLS policies as it can bypass access control

-- Update companies table - created_by should not be nullable for RLS
ALTER TABLE public.companies 
ALTER COLUMN created_by SET NOT NULL;

-- Update contacts table - created_by should not be nullable for RLS
ALTER TABLE public.contacts 
ALTER COLUMN created_by SET NOT NULL;

-- Update deals table - created_by should not be nullable for RLS
ALTER TABLE public.deals 
ALTER COLUMN created_by SET NOT NULL;

-- Update operations table - created_by should not be nullable for RLS
ALTER TABLE public.operations 
ALTER COLUMN created_by SET NOT NULL;

-- Update leads table - created_by should not be nullable for RLS
ALTER TABLE public.leads 
ALTER COLUMN created_by SET NOT NULL;

-- Update buying_mandates table - created_by should not be nullable for RLS
ALTER TABLE public.buying_mandates 
ALTER COLUMN created_by SET NOT NULL;

-- Update cases table - created_by should not be nullable for RLS
ALTER TABLE public.cases 
ALTER COLUMN created_by SET NOT NULL;

-- Update collaborators table - created_by should not be nullable for RLS
ALTER TABLE public.collaborators 
ALTER COLUMN created_by SET NOT NULL;

-- Update commission_rules table - created_by should not be nullable for RLS
ALTER TABLE public.commission_rules 
ALTER COLUMN created_by SET NOT NULL;

-- Update communication_templates table - created_by should not be nullable for RLS
ALTER TABLE public.communication_templates 
ALTER COLUMN created_by SET NOT NULL;

-- Update proposals table - created_by should not be nullable for RLS
ALTER TABLE public.proposals 
ALTER COLUMN created_by SET NOT NULL;

-- Update valoraciones table - created_by should not be nullable for RLS
ALTER TABLE public.valoraciones 
ALTER COLUMN created_by SET NOT NULL;

-- Update reconversiones_new table - created_by should not be nullable for RLS
ALTER TABLE public.reconversiones_new 
ALTER COLUMN created_by SET NOT NULL;

-- 3. Create enhanced input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_form_input(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Return empty string if input is null
  IF input_text IS NULL THEN
    RETURN '';
  END IF;

  -- Trim whitespace
  input_text := trim(input_text);
  
  -- Check length
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

-- 4. Create enhanced security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_severity text DEFAULT 'medium',
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
  user_email text;
  current_ip inet;
BEGIN
  -- Get user email if available
  IF p_user_id IS NOT NULL THEN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = p_user_id;
  END IF;
  
  -- Get IP address
  current_ip := inet_client_addr();
  
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
      'session_id', current_setting('request.session_id', true),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    p_user_id,
    user_email,
    current_ip
  ) RETURNING id INTO log_id;
  
  -- Alert on critical events
  IF p_severity = 'critical' THEN
    -- In a production environment, this would trigger alerts
    RAISE WARNING 'CRITICAL SECURITY EVENT: % - %', p_event_type, p_description;
  END IF;
  
  RETURN log_id;
END;
$$;

-- 5. Create rate limiting function for sensitive operations
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
  -- Count recent requests
  SELECT COUNT(*)
  INTO request_count
  FROM public.security_logs
  WHERE metadata->>'rate_limit_key' = p_identifier
    AND created_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Log the rate limit check
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
      'max_requests', p_max_requests,
      'window_minutes', p_window_minutes
    )
  );
  
  RETURN request_count < p_max_requests;
END;
$$;

-- 6. Update RLS policies to use secure helper functions
-- Update companies RLS policy to use secure function
DROP POLICY IF EXISTS "users_view_companies" ON public.companies;
CREATE POLICY "users_view_companies" ON public.companies
FOR SELECT USING (
  (auth.uid() = created_by) OR 
  ((owner_id IS NOT NULL) AND (auth.uid() = owner_id)) OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- Update contacts RLS policy to use secure function
DROP POLICY IF EXISTS "users_view_contacts" ON public.contacts;
CREATE POLICY "users_view_contacts" ON public.contacts
FOR SELECT USING (
  (auth.uid() = created_by) OR 
  ((owner_id IS NOT NULL) AND (auth.uid() = owner_id)) OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- Add security event for schema changes
SELECT log_security_event_enhanced(
  'schema_security_update',
  'high',
  'Critical security fixes applied: nullable user fields fixed, enhanced sanitization added',
  jsonb_build_object(
    'tables_updated', ARRAY['companies', 'contacts', 'deals', 'operations', 'leads', 'buying_mandates', 'cases', 'collaborators', 'commission_rules', 'communication_templates', 'proposals', 'valoraciones', 'reconversiones_new'],
    'functions_added', ARRAY['sanitize_form_input', 'log_security_event_enhanced', 'check_rate_limit'],
    'policies_updated', ARRAY['users_view_companies', 'users_view_contacts']
  )
);