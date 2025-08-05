-- CRITICAL SECURITY FIXES: Phase 1 - Database Security
-- Fix nullable user fields that are used in RLS policies

-- 1. Get a valid user ID to use as default for NULL values
DO $$
DECLARE
    default_user_id uuid;
BEGIN
    -- Get the first available user ID
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    IF default_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table. Cannot proceed with migration.';
    END IF;
    
    -- Update NULL created_by fields across all tables
    UPDATE companies SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE contacts SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE leads SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE operations SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE deals SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE cases SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE collaborators SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE buying_mandates SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE commissions SET approved_by = default_user_id WHERE approved_by IS NULL;
    UPDATE commission_rules SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE commission_settings SET updated_by = default_user_id WHERE updated_by IS NULL;
    UPDATE communication_templates SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE campaigns SET created_by = default_user_id WHERE created_by IS NULL;
    UPDATE api_configurations SET created_by = default_user_id WHERE created_by IS NULL;
    
    -- Log the security fix
    RAISE NOTICE 'Updated NULL created_by fields with default user ID: %', default_user_id;
END $$;

-- 2. Make critical user reference fields NOT NULL
ALTER TABLE companies ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE leads ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE operations ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE deals ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE cases ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE collaborators ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE buying_mandates ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE communication_templates ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE campaigns ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE api_configurations ALTER COLUMN created_by SET NOT NULL;

-- 3. Create enhanced security functions
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
    p_event_type text,
    p_severity text DEFAULT 'medium'::text,
    p_description text DEFAULT ''::text,
    p_metadata jsonb DEFAULT '{}'::jsonb,
    p_user_email text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    log_id uuid;
    user_email text;
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    -- Get user email if not provided
    IF p_user_email IS NULL AND current_user_id IS NOT NULL THEN
        SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
    ELSE
        user_email := p_user_email;
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
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        ),
        current_user_id,
        user_email,
        inet_client_addr()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 4. Create secure role checking function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.has_role_secure(user_id uuid, role_name app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND user_roles.role = $2
    );
$$;

-- 5. Create function to get user's highest role securely
CREATE OR REPLACE FUNCTION public.get_user_highest_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT role FROM public.user_roles 
    WHERE user_roles.user_id = $1
    ORDER BY 
        CASE role
            WHEN 'superadmin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'user' THEN 3
        END
    LIMIT 1;
$$;

-- 6. Create enhanced input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_form_input(input_text text, max_length integer DEFAULT 10000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE STRICT SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Basic input validation
    IF input_text IS NULL OR length(input_text) = 0 THEN
        RETURN '';
    END IF;
    
    -- Length validation
    IF length(input_text) > max_length THEN
        RAISE EXCEPTION 'Input too long. Maximum % characters allowed', max_length;
    END IF;
    
    -- Remove dangerous SQL patterns
    IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute|script)(\s|$)' THEN
        RAISE EXCEPTION 'Input contains dangerous SQL patterns';
    END IF;
    
    -- Remove XSS patterns and sanitize
    input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
    input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
    input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
    input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
    input_text := regexp_replace(input_text, '<[^>]*>', '', 'g');
    
    RETURN trim(input_text);
END;
$$;

-- 7. Create rate limiting function for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    operation_type text,
    user_identifier text DEFAULT auth.uid()::text,
    max_attempts integer DEFAULT 5,
    window_minutes integer DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    attempt_count integer;
    window_start timestamp with time zone;
BEGIN
    window_start := now() - (window_minutes || ' minutes')::interval;
    
    -- Count recent attempts
    SELECT COUNT(*) INTO attempt_count
    FROM security_logs
    WHERE event_type = operation_type
    AND (metadata->>'user_identifier' = user_identifier OR user_id::text = user_identifier)
    AND created_at > window_start;
    
    -- Log this attempt
    PERFORM enhanced_log_security_event(
        operation_type,
        'low',
        'Rate limit check for operation: ' || operation_type,
        jsonb_build_object(
            'user_identifier', user_identifier,
            'attempt_count', attempt_count + 1,
            'max_attempts', max_attempts,
            'window_minutes', window_minutes
        )
    );
    
    RETURN attempt_count < max_attempts;
END;
$$;

-- 8. Log this security enhancement
SELECT enhanced_log_security_event(
    'security_enhancement_migration',
    'high',
    'Critical security fixes applied: nullable fields fixed, enhanced functions created',
    jsonb_build_object(
        'migration_type', 'security_hardening',
        'fixes_applied', jsonb_build_array(
            'nullable_user_fields_fixed',
            'enhanced_security_logging',
            'secure_role_checking',
            'input_sanitization',
            'rate_limiting'
        )
    )
);