-- Fix critical security issues

-- 1. Create secure role management function with proper authorization
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(_target_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  -- Validation: Cannot assign roles to yourself
  IF auth.uid() = _target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes asignarte roles a ti mismo');
  END IF;
  
  -- Validation: Only superadmins can assign superadmin role
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  -- Validation: User must exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;
  
  -- Insert the role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment for security audit
  PERFORM public.log_security_event(
    'role_assigned_secure',
    'high',
    'Rol asignado de forma segura: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _target_user_id,
      'assigned_role', _role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the failed attempt
    PERFORM public.log_security_event(
      'role_assignment_failed',
      'high',
      'Error al asignar rol: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'attempted_by', auth.uid(),
        'error', SQLERRM
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Error interno al asignar rol');
END;
$$;

-- 2. Create function to update user role securely
CREATE OR REPLACE FUNCTION public.update_user_role_secure(_target_user_id uuid, _new_role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  -- Validation: Cannot modify your own roles
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
$$;

-- 3. Fix search_path for existing functions (already mostly fixed, but ensuring consistency)
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

-- 4. Fix has_role_secure function with proper search_path
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

-- 5. Create RLS policies that prevent direct role manipulation
-- First drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can manage user roles" ON public.user_roles;

-- Create new secure RLS policies for user_roles
CREATE POLICY "Only superadmins can directly manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role_secure(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view all roles for UI purposes"
ON public.user_roles
FOR SELECT
USING (true);

-- 6. Add security event logging for suspicious activities
CREATE OR REPLACE FUNCTION public.log_role_manipulation_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log any attempt to directly manipulate roles outside of secure functions
  PERFORM public.log_security_event(
    'direct_role_manipulation_attempt',
    'critical',
    'Intento de manipulación directa de roles detectado',
    jsonb_build_object(
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'attempted_role', COALESCE(NEW.role, OLD.role),
      'operation', TG_OP,
      'attempted_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  -- Allow the operation only for superadmins
  IF public.has_role_secure(auth.uid(), 'superadmin') THEN
    RETURN COALESCE(NEW, OLD);
  ELSE
    RAISE EXCEPTION 'Acceso denegado: Use las funciones seguras para gestionar roles';
  END IF;
END;
$$;

-- Add trigger to monitor direct role manipulations
DROP TRIGGER IF EXISTS monitor_role_manipulations ON public.user_roles;
CREATE TRIGGER monitor_role_manipulations
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_manipulation_attempt();