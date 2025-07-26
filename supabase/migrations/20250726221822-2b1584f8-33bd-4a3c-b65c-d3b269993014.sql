-- Security Fix: Add search_path protection to database functions
-- This prevents SQL injection through search path manipulation

-- Fix function: get_current_user_role_safe
DROP FUNCTION IF EXISTS public.get_current_user_role_safe();
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$function$;

-- Fix function: test_auth_uid
DROP FUNCTION IF EXISTS public.test_auth_uid();
CREATE OR REPLACE FUNCTION public.test_auth_uid()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
  user_email TEXT;
  user_roles_count INTEGER;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Intentar obtener el email del usuario
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Contar roles del usuario
  SELECT COUNT(*) INTO user_roles_count
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  RETURN jsonb_build_object(
    'auth_uid', current_user_id,
    'user_email', user_email,
    'user_roles_count', user_roles_count,
    'timestamp', now()
  );
END;
$function$;

-- Fix function: get_quantum_token
DROP FUNCTION IF EXISTS public.get_quantum_token();
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

-- Fix function: get_integraloop_config
DROP FUNCTION IF EXISTS public.get_integraloop_config();
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

-- Fix function: has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix function: get_user_highest_role
DROP FUNCTION IF EXISTS public.get_user_highest_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$function$;

-- Fix function: is_admin_user
DROP FUNCTION IF EXISTS public.is_admin_user();
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$function$;

-- Fix function: get_users_with_roles
DROP FUNCTION IF EXISTS public.get_users_with_roles();
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, role app_role, first_name text, last_name text, company text, phone text, is_manager boolean, manager_name text, manager_position text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_highest_roles AS (
    SELECT 
      ur.user_id,
      ur.role,
      ROW_NUMBER() OVER (
        PARTITION BY ur.user_id 
        ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'user' THEN 3
          END
      ) as rn
    FROM user_roles ur
  )
  SELECT 
    u.id as user_id,
    u.email,
    uhr.role,
    up.first_name,
    up.last_name,
    up.company,
    up.phone,
    (om.id IS NOT NULL) as is_manager,
    om.name as manager_name,
    om.position as manager_position
  FROM auth.users u
  LEFT JOIN user_highest_roles uhr ON u.id = uhr.user_id AND uhr.rn = 1
  LEFT JOIN user_profiles up ON u.id = up.id
  LEFT JOIN operation_managers om ON u.id = om.user_id
  WHERE u.email IS NOT NULL
  ORDER BY uhr.role NULLS LAST, u.email;
$function$;

-- Fix function: delete_user_completely
DROP FUNCTION IF EXISTS public.delete_user_completely(uuid);
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

-- Fix function: remove_user_role
DROP FUNCTION IF EXISTS public.remove_user_role(uuid, app_role);
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