-- Create function to safely delete users from the system
CREATE OR REPLACE FUNCTION public.delete_user_completely(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Create function to remove user role only
CREATE OR REPLACE FUNCTION public.remove_user_role(_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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