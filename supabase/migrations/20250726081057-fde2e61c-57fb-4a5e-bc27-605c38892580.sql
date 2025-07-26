-- Crear función de debug para probar auth.uid()
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