
-- Agregar claves foráneas a la tabla valoraciones
ALTER TABLE public.valoraciones 
ADD COLUMN company_id UUID REFERENCES public.companies(id),
ADD COLUMN contact_id UUID REFERENCES public.contacts(id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_valoraciones_company_id ON public.valoraciones(company_id);
CREATE INDEX idx_valoraciones_contact_id ON public.valoraciones(contact_id);

-- Función para validar que empresa y contacto existen antes de crear/editar valoración
CREATE OR REPLACE FUNCTION public.validate_valoracion_entities(p_company_id UUID, p_contact_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  company_exists BOOLEAN := FALSE;
  contact_exists BOOLEAN := FALSE;
  contact_belongs_to_company BOOLEAN := FALSE;
BEGIN
  -- Verificar que la empresa existe
  SELECT EXISTS(SELECT 1 FROM public.companies WHERE id = p_company_id) INTO company_exists;
  
  -- Verificar que el contacto existe
  SELECT EXISTS(SELECT 1 FROM public.contacts WHERE id = p_contact_id) INTO contact_exists;
  
  -- Verificar que el contacto pertenece a la empresa (si está definido)
  SELECT EXISTS(
    SELECT 1 FROM public.contacts 
    WHERE id = p_contact_id 
    AND (company_id = p_company_id OR company_id IS NULL)
  ) INTO contact_belongs_to_company;
  
  RETURN company_exists AND contact_exists AND contact_belongs_to_company;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para prevenir eliminación de empresas con valoraciones activas
CREATE OR REPLACE FUNCTION public.prevent_company_delete_with_active_valoraciones()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM public.valoraciones 
    WHERE company_id = OLD.id 
    AND status IN ('requested', 'in_process')
  ) THEN
    RAISE EXCEPTION 'No se puede eliminar la empresa porque tiene valoraciones activas. Reasigne o complete las valoraciones primero.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Función para prevenir eliminación de contactos con valoraciones activas
CREATE OR REPLACE FUNCTION public.prevent_contact_delete_with_active_valoraciones()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM public.valoraciones 
    WHERE contact_id = OLD.id 
    AND status IN ('requested', 'in_process')
  ) THEN
    RAISE EXCEPTION 'No se puede eliminar el contacto porque tiene valoraciones activas. Reasigne o complete las valoraciones primero.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para prevenir eliminación
CREATE TRIGGER prevent_company_delete_with_valoraciones
  BEFORE DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION prevent_company_delete_with_active_valoraciones();

CREATE TRIGGER prevent_contact_delete_with_valoraciones
  BEFORE DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION prevent_contact_delete_with_active_valoraciones();

-- Trigger para validar entidades al insertar/actualizar valoraciones
CREATE OR REPLACE FUNCTION public.validate_valoracion_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo validar si se proporcionan ambos IDs
  IF NEW.company_id IS NOT NULL AND NEW.contact_id IS NOT NULL THEN
    IF NOT public.validate_valoracion_entities(NEW.company_id, NEW.contact_id) THEN
      RAISE EXCEPTION 'La empresa o contacto especificados no existen o no están correctamente relacionados.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_valoracion_entities_trigger
  BEFORE INSERT OR UPDATE ON public.valoraciones
  FOR EACH ROW EXECUTE FUNCTION validate_valoracion_on_change();

-- Actualizar las políticas RLS para incluir las nuevas relaciones
DROP POLICY IF EXISTS "Users can view all valoraciones" ON public.valoraciones;
DROP POLICY IF EXISTS "Users can create valoraciones" ON public.valoraciones;
DROP POLICY IF EXISTS "Users can update valoraciones" ON public.valoraciones;
DROP POLICY IF EXISTS "Users can delete valoraciones" ON public.valoraciones;

-- Políticas actualizadas que consideran las relaciones con empresas y contactos
CREATE POLICY "Users can view valoraciones with entity access"
  ON public.valoraciones
  FOR SELECT
  USING (
    -- Admin/superadmin pueden ver todas
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
    OR
    -- Usuarios pueden ver valoraciones de empresas que crearon o poseen
    (company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid())
    ))
    OR
    -- Usuarios pueden ver valoraciones de contactos que crearon
    (contact_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = contact_id 
      AND created_by = auth.uid()
    ))
    OR
    -- Usuario asignado puede ver la valoración
    assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create valoraciones with entity validation"
  ON public.valoraciones
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    -- Solo si tienen acceso a la empresa
    (company_id IS NULL OR EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    ))
    AND
    -- Solo si tienen acceso al contacto
    (contact_id IS NULL OR EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = contact_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    ))
  );

CREATE POLICY "Users can update valoraciones with entity access"
  ON public.valoraciones
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
    OR
    assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    (company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid())
    ))
  );

CREATE POLICY "Admin users can delete valoraciones"
  ON public.valoraciones
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );
