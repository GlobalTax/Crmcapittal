
-- Primero eliminar todas las políticas que dependen de admin_users
-- Luego refactorizar el sistema usando la nueva estructura

-- 1. Eliminar políticas que dependen de admin_users en operations
DROP POLICY IF EXISTS "Solo admins pueden insertar operaciones" ON public.operations;
DROP POLICY IF EXISTS "Solo admins pueden actualizar operaciones" ON public.operations;
DROP POLICY IF EXISTS "Solo admins pueden eliminar operaciones" ON public.operations;
DROP POLICY IF EXISTS "Admins pueden ver todas las operaciones" ON public.operations;

-- 2. Eliminar políticas que dependen de admin_users en operation_managers
DROP POLICY IF EXISTS "Solo admins pueden ver gestores" ON public.operation_managers;
DROP POLICY IF EXISTS "Solo admins pueden insertar gestores" ON public.operation_managers;
DROP POLICY IF EXISTS "Solo admins pueden actualizar gestores" ON public.operation_managers;
DROP POLICY IF EXISTS "Solo admins pueden eliminar gestores" ON public.operation_managers;

-- 3. Eliminar políticas de storage que dependen de admin_users
DROP POLICY IF EXISTS "Admins pueden subir fotos de operaciones" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden actualizar fotos de operaciones" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden eliminar fotos de operaciones" ON storage.objects;

-- 4. Ahora agregar user_id a operation_managers
ALTER TABLE public.operation_managers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Crear función para sincronizar gestores con roles
CREATE OR REPLACE FUNCTION public.sync_manager_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se crea un manager, asignar rol admin
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Cuando se elimina un manager, quitar rol admin (si no es superadmin)
  IF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = OLD.user_id 
    AND role = 'admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = OLD.user_id 
      AND role = 'superadmin'::app_role
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para sincronización automática
CREATE TRIGGER sync_manager_role_trigger
  AFTER INSERT OR DELETE ON public.operation_managers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_manager_role();

-- 7. Ahora eliminar la tabla admin_users
DROP TABLE IF EXISTS public.admin_users;

-- 8. Crear función para obtener información completa de usuarios con roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role app_role,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  is_manager BOOLEAN,
  manager_name TEXT,
  manager_position TEXT
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    up.first_name,
    up.last_name,
    up.company,
    up.phone,
    (om.id IS NOT NULL) as is_manager,
    om.name as manager_name,
    om.position as manager_position
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  LEFT JOIN public.user_profiles up ON u.id = up.id
  LEFT JOIN public.operation_managers om ON u.id = om.user_id
  ORDER BY ur.role, u.email;
$$;

-- 9. Recrear políticas usando el sistema de roles unificado
-- Para operations (estas ya existen en las migraciones anteriores, pero las reforzamos)
CREATE POLICY "Admins can manage all operations via roles" 
  ON public.operations 
  FOR ALL 
  TO authenticated
  USING (public.is_admin_user());

-- Para operation_managers
CREATE POLICY "Admins can manage operation_managers via roles" 
  ON public.operation_managers 
  FOR ALL 
  TO authenticated
  USING (public.is_admin_user());

-- Para storage (teasers)
CREATE POLICY "Admins can manage teaser files via roles" 
  ON storage.objects 
  FOR ALL 
  TO authenticated
  USING (
    bucket_id = 'teasers' AND
    public.is_admin_user()
  );
