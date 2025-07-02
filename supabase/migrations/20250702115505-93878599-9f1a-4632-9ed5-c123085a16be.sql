
-- Crear políticas RLS para la tabla tracked_emails
-- Primero verificamos que RLS esté habilitado (ya debe estarlo según las migraciones)

-- Política para que los usuarios puedan ver emails rastreados
CREATE POLICY "Users can view tracked emails" 
  ON public.tracked_emails 
  FOR SELECT 
  USING (
    -- Los usuarios pueden ver emails si son admin/superadmin
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Política para que los usuarios puedan crear emails rastreados
CREATE POLICY "Users can create tracked emails" 
  ON public.tracked_emails 
  FOR INSERT 
  WITH CHECK (
    -- Los usuarios pueden crear emails si son admin/superadmin
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Política para que los usuarios puedan actualizar emails rastreados (para tracking)
CREATE POLICY "Users can update tracked emails for tracking" 
  ON public.tracked_emails 
  FOR UPDATE 
  USING (
    -- Permitir actualizaciones para tracking (status, open_count, etc.)
    -- No requiere autenticación para permitir el tracking pixel
    true
  );
