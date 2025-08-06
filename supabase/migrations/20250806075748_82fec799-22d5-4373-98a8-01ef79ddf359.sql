-- CRITICAL SECURITY FIXES - Phase 2
-- Address remaining Security Definer Views and Function Search Paths

-- First, let's find and fix any problematic views
-- Check if there are any views with SECURITY DEFINER that shouldn't have it

-- Fix critical functions that need explicit search_path
-- Some key functions that likely need search_path fixes:

-- Fix get_user_highest_role function
DROP FUNCTION IF EXISTS public.get_user_highest_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix has_role_secure function 
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fix enhanced_log_security_event function
DROP FUNCTION IF EXISTS public.enhanced_log_security_event(text, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'medium'::text,
  p_description text DEFAULT ''::text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
  user_email text;
  user_ip inet;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get IP address
  user_ip := inet_client_addr();
  
  -- Insert enhanced security log
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    user_email,
    ip_address,
    session_id,
    user_agent
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata || jsonb_build_object(
      'timestamp', now(),
      'source', 'enhanced_security_event',
      'severity_level', p_severity
    ),
    auth.uid(),
    user_email,
    user_ip,
    current_setting('request.jwt.claims', true)::jsonb->>'session_id',
    current_setting('request.headers', true)::jsonb->>'user-agent'
  ) RETURNING id INTO log_id;
  
  -- Log critical events to audit trail as well
  IF p_severity IN ('high', 'critical') THEN
    INSERT INTO public.audit_trail (
      table_name,
      operation,
      user_id,
      user_email,
      new_data,
      ip_address,
      user_agent,
      session_id
    ) VALUES (
      'security_logs',
      'SECURITY_EVENT',
      auth.uid(),
      user_email,
      jsonb_build_object(
        'event_type', p_event_type,
        'severity', p_severity,
        'description', p_description,
        'metadata', p_metadata
      ),
      user_ip,
      current_setting('request.headers', true)::jsonb->>'user-agent',
      current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    );
  END IF;
  
  RETURN log_id;
END;
$$;

-- Add comprehensive role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enhanced_log_security_event(
      'role_assigned',
      'high',
      'Nuevo rol asignado: ' || NEW.role::text || ' al usuario: ' || NEW.user_id::text,
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'assigned_role', NEW.role,
        'assigned_by', auth.uid(),
        'operation', 'INSERT'
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.enhanced_log_security_event(
      'role_removed',
      'high',
      'Rol removido: ' || OLD.role::text || ' del usuario: ' || OLD.user_id::text,
      jsonb_build_object(
        'target_user_id', OLD.user_id,
        'removed_role', OLD.role,
        'removed_by', auth.uid(),
        'operation', 'DELETE'
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Apply the trigger to user_roles table
DROP TRIGGER IF EXISTS audit_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER audit_role_assignment_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_assignment();