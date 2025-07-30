-- SECURITY FIX: Phase 1 - Critical Database Security Fixes

-- 1.1 Fix RLS Policy Conflicts on user_roles Table
-- First, drop all existing conflicting policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only authenticated users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can delete roles" ON public.user_roles;

-- Create new, secure and non-conflicting RLS policies for user_roles
CREATE POLICY "Users can view their own roles only"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Only secure functions can modify roles"
ON public.user_roles
FOR ALL
USING (false)
WITH CHECK (false);

-- 1.2 Create secure role management function with privilege escalation prevention
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Get user's highest role function
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- 1.3 Fix Security Definer Functions - Set proper search_path
CREATE OR REPLACE FUNCTION public.update_user_role_secure(_target_user_id uuid, _new_role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_role app_role;
  target_current_role app_role;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Get target user's current highest role
  SELECT public.get_user_highest_role(_target_user_id) INTO target_current_role;
  
  -- Validation: Only admins and superadmins can update roles
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para modificar roles');
  END IF;
  
  -- Validation: Cannot modify your own roles (prevent privilege escalation)
  IF auth.uid() = _target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes modificar tus propios roles');
  END IF;
  
  -- Validation: Only superadmins can assign superadmin role or modify other superadmins
  IF (_new_role = 'superadmin' OR target_current_role = 'superadmin') AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden gestionar roles de superadministrador');
  END IF;
  
  -- Remove all current roles for the user
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_target_user_id, _new_role);
  
  -- Log the role change for security audit
  PERFORM public.log_security_event(
    'role_updated_secure',
    'high',
    'Rol actualizado de forma segura: ' || COALESCE(target_current_role::text, 'ninguno') || ' → ' || _new_role::text,
    jsonb_build_object(
      'target_user_id', _target_user_id,
      'old_role', target_current_role,
      'new_role', _new_role,
      'updated_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol actualizado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the failed attempt
    PERFORM public.log_security_event(
      'role_update_failed',
      'high',
      'Error al actualizar rol: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _new_role,
        'attempted_by', auth.uid(),
        'error', SQLERRM
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Error interno al actualizar rol');
END;
$function$;

-- Create privilege escalation detection trigger
CREATE OR REPLACE FUNCTION public.detect_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log any attempt to directly manipulate roles outside of secure functions
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
      'session_info', current_setting('request.headers', true)
    )
  );
  
  -- Block the operation unless it's from a superadmin using secure functions
  IF public.has_role_secure(auth.uid(), 'superadmin') THEN
    RETURN COALESCE(NEW, OLD);
  ELSE
    RAISE EXCEPTION 'Acceso denegado: Use las funciones seguras para gestionar roles. Intento de escalación de privilegios registrado.';
  END IF;
END;
$function$;

-- Apply the privilege escalation detection trigger
DROP TRIGGER IF EXISTS prevent_privilege_escalation ON public.user_roles;
CREATE TRIGGER prevent_privilege_escalation
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_privilege_escalation();

-- 1.4 Create enhanced security monitoring functions
CREATE OR REPLACE FUNCTION public.log_failed_authentication(
  p_email text,
  p_reason text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    user_email,
    ip_address
  ) VALUES (
    'failed_authentication',
    'high',
    'Intento de autenticación fallido: ' || p_reason,
    jsonb_build_object(
      'attempted_email', p_email,
      'failure_reason', p_reason,
      'user_agent', p_user_agent,
      'timestamp', now()
    ),
    NULL,
    p_email,
    COALESCE(p_ip_address, inet_client_addr())
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Create rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, window_start)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);