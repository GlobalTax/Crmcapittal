-- CRITICAL SECURITY FIXES - PHASE 1
-- Fix 1: Remove ALL existing dangerous user_roles RLS policies
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can view all user roles" ON public.user_roles;

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

-- Fix 3: Create secure user roles view policies
CREATE POLICY "Secure admin roles view" 
ON public.user_roles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

CREATE POLICY "Secure personal roles view" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Fix 4: Create comprehensive security logging function
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

-- Fix 5: Fix function search paths for existing functions
CREATE OR REPLACE FUNCTION public.get_quantum_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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