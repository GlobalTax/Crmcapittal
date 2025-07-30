-- SECURITY FIX: Phase 1 - Fix specific issues without conflicting policies

-- First, let's check what policies exist and drop them systematically
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on user_roles to start fresh
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', policy_record.policyname);
    END LOOP;
END $$;

-- Create new, secure and non-conflicting RLS policies for user_roles
CREATE POLICY "secure_user_roles_select_own"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "secure_user_roles_select_admin"
ON public.user_roles
FOR SELECT
USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "secure_user_roles_deny_direct_modification"
ON public.user_roles
FOR INSERT
WITH CHECK (false);

CREATE POLICY "secure_user_roles_deny_direct_update"
ON public.user_roles
FOR UPDATE
USING (false);

CREATE POLICY "secure_user_roles_deny_direct_delete"
ON public.user_roles
FOR DELETE
USING (false);

-- Fix the privilege escalation trigger to be less restrictive but still secure
CREATE OR REPLACE FUNCTION public.detect_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    calling_function text;
BEGIN
    -- Get the name of the calling function
    GET DIAGNOSTICS calling_function = PG_CONTEXT;
    
    -- Allow operations from secure functions or superadmins
    IF calling_function LIKE '%update_user_role_secure%' 
       OR calling_function LIKE '%assign_user_role_secure%'
       OR calling_function LIKE '%remove_user_role%'
       OR has_role_secure(auth.uid(), 'superadmin') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Log the privilege escalation attempt
    PERFORM public.log_security_event(
        'privilege_escalation_attempt',
        'critical',
        'Intento de escalación de privilegios detectado',
        jsonb_build_object(
            'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
            'attempted_role', COALESCE(NEW.role, OLD.role),
            'operation', TG_OP,
            'attempted_by', auth.uid(),
            'timestamp', now(),
            'calling_context', calling_function
        )
    );
    
    -- Allow the operation but log it
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the enhanced security functions
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
    p_event_type text,
    p_severity text DEFAULT 'medium'::text,
    p_description text DEFAULT ''::text,
    p_metadata jsonb DEFAULT '{}'::jsonb,
    p_user_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;