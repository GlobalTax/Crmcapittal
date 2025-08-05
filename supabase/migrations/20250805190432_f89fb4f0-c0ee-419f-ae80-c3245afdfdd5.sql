-- Eliminar función existente y recrear con la nueva firma
DROP FUNCTION IF EXISTS public.get_users_with_roles();

-- Función mejorada para obtener usuarios con roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  is_manager boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    u.id as user_id,
    u.email,
    up.first_name,
    up.last_name,
    COALESCE(ur.role::text, 'user') as role,
    CASE WHEN ur.role IN ('admin', 'superadmin') THEN true ELSE false END as is_manager
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.id
  LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, role
    FROM public.user_roles
    ORDER BY user_id, 
      CASE role
        WHEN 'superadmin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'user' THEN 3
      END
  ) ur ON u.id = ur.user_id
  ORDER BY u.email;
$$;