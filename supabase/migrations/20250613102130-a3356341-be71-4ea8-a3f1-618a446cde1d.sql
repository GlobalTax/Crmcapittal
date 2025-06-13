
-- Eliminar todas las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorite_operations;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorite_operations;
DROP POLICY IF EXISTS "Public can view available operations" ON public.operations;
DROP POLICY IF EXISTS "Authenticated users can insert operations" ON public.operations;
DROP POLICY IF EXISTS "Users can update own operations" ON public.operations;
DROP POLICY IF EXISTS "Admins can view all operations" ON public.operations;
DROP POLICY IF EXISTS "Admins can update all operations" ON public.operations;
DROP POLICY IF EXISTS "Admins can delete all operations" ON public.operations;
DROP POLICY IF EXISTS "Users can delete own operations" ON public.operations;
DROP POLICY IF EXISTS "Anyone can view managers" ON public.operation_managers;
DROP POLICY IF EXISTS "Admins can manage operation_managers" ON public.operation_managers;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmins can manage admin_users" ON public.admin_users;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Crear función de seguridad para verificar roles de admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$$;

-- Políticas para operations
CREATE POLICY "Public can view available operations" 
  ON public.operations 
  FOR SELECT 
  USING (status = 'available');

CREATE POLICY "Authenticated users can insert operations" 
  ON public.operations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own operations" 
  ON public.operations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all operations" 
  ON public.operations 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Admins can update all operations" 
  ON public.operations 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete all operations" 
  ON public.operations 
  FOR DELETE 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Users can delete own operations" 
  ON public.operations 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Políticas para operation_managers
CREATE POLICY "Anyone can view managers" 
  ON public.operation_managers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage operation_managers" 
  ON public.operation_managers 
  FOR ALL 
  TO authenticated
  USING (public.is_admin_user());

-- Políticas para user_favorite_operations
CREATE POLICY "Users can view own favorites" 
  ON public.user_favorite_operations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" 
  ON public.user_favorite_operations 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para admin_users
CREATE POLICY "Admins can view admin_users" 
  ON public.admin_users 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Superadmins can manage admin_users" 
  ON public.admin_users 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
  );

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_operations_sector ON public.operations(sector);
CREATE INDEX IF NOT EXISTS idx_operations_status ON public.operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_created_by ON public.operations(created_by);
CREATE INDEX IF NOT EXISTS idx_operations_date ON public.operations(date);
CREATE INDEX IF NOT EXISTS idx_operations_amount ON public.operations(amount);
CREATE INDEX IF NOT EXISTS idx_user_favorite_operations_user_id ON public.user_favorite_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_operations_operation_id ON public.user_favorite_operations(operation_id);
