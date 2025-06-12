
-- Habilitar RLS en la tabla operations si no está habilitado
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios autenticados ver todas las operaciones disponibles
CREATE POLICY "Users can view available operations" 
  ON public.operations 
  FOR SELECT 
  USING (status = 'available' OR auth.uid() = created_by);

-- Política para permitir a los usuarios autenticados insertar operaciones
CREATE POLICY "Authenticated users can insert operations" 
  ON public.operations 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir a los usuarios actualizar sus propias operaciones
CREATE POLICY "Users can update their own operations" 
  ON public.operations 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Política para permitir a los administradores ver todas las operaciones
CREATE POLICY "Admins can view all operations" 
  ON public.operations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Política para permitir a los administradores actualizar cualquier operación
CREATE POLICY "Admins can update all operations" 
  ON public.operations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );
