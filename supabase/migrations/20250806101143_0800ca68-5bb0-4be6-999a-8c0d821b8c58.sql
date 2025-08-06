-- Arreglar la función get_users_with_roles
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  is_manager BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::TEXT as email,
    COALESCE(up.first_name, '')::TEXT as first_name,
    COALESCE(up.last_name, '')::TEXT as last_name,
    COALESCE(ur.role::TEXT, 'user'::TEXT) as role,
    CASE 
      WHEN ur.role IN ('admin', 'superadmin') THEN true 
      ELSE false 
    END as is_manager
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE au.email_confirmed_at IS NOT NULL
  ORDER BY up.first_name, up.last_name;
END;
$$;