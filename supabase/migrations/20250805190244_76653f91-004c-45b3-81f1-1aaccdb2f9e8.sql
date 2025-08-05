-- Crear función get_user_highest_role si no existe o actualizarla
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    SELECT user_id, role
    FROM public.user_roles
    WHERE role = (
      SELECT role FROM public.user_roles ur2 
      WHERE ur2.user_id = user_roles.user_id
      ORDER BY 
        CASE role
          WHEN 'superadmin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'user' THEN 3
        END
      LIMIT 1
    )
  ) ur ON u.id = ur.user_id
  ORDER BY u.email;
$$;