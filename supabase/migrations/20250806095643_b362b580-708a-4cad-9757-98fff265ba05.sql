-- Crear función get_users_with_roles si no existe
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  is_manager boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id as user_id,
    au.email,
    up.first_name,
    up.last_name,
    COALESCE(ur.role::text, 'user') as role,
    false as is_manager
  FROM auth.users au
  JOIN public.user_profiles up ON au.id = up.id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE au.deleted_at IS NULL
  ORDER BY up.first_name, up.last_name;
END;
$$;