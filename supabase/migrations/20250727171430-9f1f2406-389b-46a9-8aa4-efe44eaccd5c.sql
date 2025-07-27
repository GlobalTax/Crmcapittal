-- CRITICAL SECURITY FIXES
-- Fix 1: Remove dangerous user_roles RLS policy that allows users to manage their own roles
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Fix 2: Create secure role management functions with proper security
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role app_role;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Validation: Only admins and superadmins can assign roles
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
  END IF;
  
  -- Validation: Cannot modify your own roles
  IF auth.uid() = _user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes modificar tus propios roles');
  END IF;
  
  -- Validation: Only superadmins can assign superadmin role
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  -- Insert the role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment
  PERFORM public.log_security_event(
    'user_role_assigned',
    'medium',
    'Rol de usuario asignado: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _user_id,
      'assigned_role', _role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Error al asignar rol: ' || SQLERRM);
END;
$function$;

-- Fix 3: Create secure role removal function
CREATE OR REPLACE FUNCTION public.remove_user_role(_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role app_role;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Validation: Only admins and superadmins can remove roles
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para gestionar roles');
  END IF;
  
  -- Validation: Cannot modify your own roles
  IF auth.uid() = _user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes modificar tus propios roles');
  END IF;
  
  -- Validation: Only superadmins can remove superadmin role
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden gestionar roles de superadministrador');
  END IF;
  
  -- Remove the specific role
  DELETE FROM public.user_roles 
  WHERE user_id = _user_id AND role = _role;
  
  -- If removing admin role, also remove from operation_managers if they are a manager
  IF _role = 'admin' THEN
    DELETE FROM public.operation_managers WHERE user_id = _user_id;
  END IF;
  
  -- Log the role removal
  PERFORM public.log_security_event(
    'user_role_removed',
    'medium',
    'Rol de usuario removido: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _user_id,
      'removed_role', _role,
      'removed_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol removido exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Error al remover rol: ' || SQLERRM);
END;
$function$;

-- Fix 4: Create proper RLS policies for user_roles table
CREATE POLICY "Admin users can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies - these operations must go through secure functions

-- Fix 5: Improve existing functions with proper search paths
CREATE OR REPLACE FUNCTION public.get_quantum_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Obtener token desde variable de entorno
  RETURN current_setting('app.quantum_token', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_integraloop_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'subscription_key', current_setting('app.integraloop_subscription_key', true),
    'api_user', current_setting('app.integraloop_api_user', true),
    'api_password', current_setting('app.integraloop_api_password', true),
    'base_url', current_setting('app.integraloop_base_url', true)
  );
END;
$function$;

-- Fix 6: Create comprehensive security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'medium',
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  user_email text;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Insert security log
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
    p_metadata,
    auth.uid(),
    user_email,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Fix 7: Create rate limiting function with proper security
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in the time window
  SELECT COUNT(*) INTO request_count
  FROM public.security_logs
  WHERE metadata->>'rate_limit_identifier' = p_identifier
  AND created_at > window_start;
  
  -- Log this rate limit check
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id
  ) VALUES (
    'rate_limit_check',
    'low',
    'Rate limit check for: ' || p_identifier,
    jsonb_build_object(
      'rate_limit_identifier', p_identifier,
      'current_count', request_count,
      'limit', p_max_requests,
      'window_minutes', p_window_minutes,
      'allowed', request_count < p_max_requests
    ),
    auth.uid()
  );
  
  RETURN request_count < p_max_requests;
END;
$function$;

-- Fix 8: Add comprehensive security monitoring trigger
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Monitor for suspicious patterns
  IF NEW.severity = 'high' OR NEW.severity = 'critical' THEN
    -- Log high-severity events for immediate attention
    PERFORM pg_notify('security_alert', 
      jsonb_build_object(
        'event_type', NEW.event_type,
        'severity', NEW.severity,
        'user_id', NEW.user_id,
        'description', NEW.description,
        'timestamp', NEW.created_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for security monitoring
DROP TRIGGER IF EXISTS security_event_monitor ON public.security_logs;
CREATE TRIGGER security_event_monitor
  AFTER INSERT ON public.security_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_security_events();

-- Fix 9: Create secure user deletion function
CREATE OR REPLACE FUNCTION public.delete_user_completely(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_role app_role;
  current_user_role app_role;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Get target user's highest role
  SELECT public.get_user_highest_role(_user_id) INTO target_user_role;
  
  -- Validation: Only admins and superadmins can delete users
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para eliminar usuarios');
  END IF;
  
  -- Validation: Cannot delete yourself
  IF auth.uid() = _user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes eliminarte a ti mismo');
  END IF;
  
  -- Validation: Only superadmins can delete other superadmins
  IF target_user_role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden eliminar a otros superadministradores');
  END IF;
  
  -- Delete related records in order (respecting foreign key constraints)
  -- 1. Delete from operation_managers
  DELETE FROM public.operation_managers WHERE user_id = _user_id;
  
  -- 2. Delete from user_roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- 3. Delete from user_profiles
  DELETE FROM public.user_profiles WHERE id = _user_id;
  
  -- 4. Delete from auth.users (this is the critical step)
  DELETE FROM auth.users WHERE id = _user_id;
  
  -- Log the deletion for security purposes
  PERFORM public.log_security_event(
    'user_deleted',
    'high',
    'Usuario eliminado completamente del sistema',
    jsonb_build_object(
      'deleted_user_id', _user_id,
      'deleted_by', auth.uid(),
      'deleted_user_role', target_user_role
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Usuario eliminado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    PERFORM public.log_security_event(
      'user_deletion_failed',
      'high',
      'Error al eliminar usuario: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _user_id,
        'attempted_by', auth.uid(),
        'error_message', SQLERRM
      )
    );
    
    RETURN jsonb_build_object('success', false, 'error', 'Error al eliminar usuario: ' || SQLERRM);
END;
$function$;