
-- 1. Crear función de validación de asociaciones de valoraciones
CREATE OR REPLACE FUNCTION public.validate_valoracion_associations(
  p_company_id UUID,
  p_contact_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  company_exists BOOLEAN := FALSE;
  contact_exists BOOLEAN := FALSE;
  contact_belongs_to_company BOOLEAN := FALSE;
BEGIN
  -- Verificar que la empresa existe y está activa
  SELECT EXISTS(
    SELECT 1 FROM public.companies 
    WHERE id = p_company_id 
    AND company_status != 'inactive'
  ) INTO company_exists;
  
  -- Verificar que el contacto existe
  SELECT EXISTS(
    SELECT 1 FROM public.contacts 
    WHERE id = p_contact_id
  ) INTO contact_exists;
  
  -- Verificar que el contacto pertenece a la empresa (si ambos están definidos)
  IF p_company_id IS NOT NULL AND p_contact_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.contacts 
      WHERE id = p_contact_id 
      AND company_id = p_company_id
    ) INTO contact_belongs_to_company;
  ELSE
    contact_belongs_to_company := TRUE; -- Si uno es NULL, no validamos relación
  END IF;
  
  RETURN company_exists AND contact_exists AND contact_belongs_to_company;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger de auditoría completa para valoraciones
CREATE OR REPLACE FUNCTION public.audit_valoracion_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}'::jsonb;
  change_description TEXT := '';
  old_values JSONB;
  new_values JSONB;
BEGIN
  -- Manejar INSERT (valoración creada)
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'valoracion_created',
      'medium',
      'Nueva valoración creada: ' || NEW.company_name,
      jsonb_build_object(
        'valoracion_id', NEW.id,
        'company_id', NEW.company_id,
        'contact_id', NEW.contact_id,
        'company_name', NEW.company_name,
        'client_name', NEW.client_name,
        'status', NEW.status,
        'assigned_to', NEW.assigned_to
      ),
      auth.uid()
    );
    
    -- Log en tabla específica de valoraciones
    INSERT INTO public.valoracion_security_logs (
      valoracion_id,
      action,
      details,
      severity,
      user_id
    ) VALUES (
      NEW.id,
      'valoracion_created',
      jsonb_build_object(
        'company_name', NEW.company_name,
        'status', NEW.status,
        'assigned_to', NEW.assigned_to
      ),
      'medium',
      auth.uid()
    );
    
    RETURN NEW;
  END IF;
  
  -- Manejar UPDATE (valoración modificada)
  IF TG_OP = 'UPDATE' THEN
    -- Detectar cambios en campos críticos
    IF OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      changes := changes || jsonb_build_object('company_id', 
        jsonb_build_object('from', OLD.company_id, 'to', NEW.company_id));
      change_description := change_description || 'Empresa asociada cambiada. ';
    END IF;
    
    IF OLD.contact_id IS DISTINCT FROM NEW.contact_id THEN
      changes := changes || jsonb_build_object('contact_id', 
        jsonb_build_object('from', OLD.contact_id, 'to', NEW.contact_id));
      change_description := change_description || 'Contacto asociado cambiado. ';
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      changes := changes || jsonb_build_object('status', 
        jsonb_build_object('from', OLD.status, 'to', NEW.status));
      change_description := change_description || 'Estado cambiado de ' || OLD.status || ' a ' || NEW.status || '. ';
      
      -- Log específico para cambios de fase
      INSERT INTO public.valoracion_security_logs (
        valoracion_id,
        action,
        details,
        severity,
        user_id
      ) VALUES (
        NEW.id,
        'phase_change',
        jsonb_build_object(
          'from_phase', OLD.status,
          'to_phase', NEW.status,
          'changed_by', auth.uid()
        ),
        'high',
        auth.uid()
      );
    END IF;
    
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      changes := changes || jsonb_build_object('assigned_to', 
        jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to));
      change_description := change_description || 'Asignación cambiada. ';
    END IF;
    
    IF OLD.fee_quoted IS DISTINCT FROM NEW.fee_quoted THEN
      changes := changes || jsonb_build_object('fee_quoted', 
        jsonb_build_object('from', OLD.fee_quoted, 'to', NEW.fee_quoted));
      change_description := change_description || 'Honorario cotizado cambiado. ';
    END IF;
    
    IF OLD.fee_charged IS DISTINCT FROM NEW.fee_charged THEN
      changes := changes || jsonb_build_object('fee_charged', 
        jsonb_build_object('from', OLD.fee_charged, 'to', NEW.fee_charged));
      change_description := change_description || 'Honorario cobrado cambiado. ';
    END IF;
    
    -- Solo registrar si hay cambios significativos
    IF changes != '{}'::jsonb THEN
      PERFORM public.log_security_event(
        'valoracion_updated',
        'medium',
        'Valoración actualizada: ' || COALESCE(change_description, 'Cambios realizados'),
        jsonb_build_object(
          'valoracion_id', NEW.id,
          'changes', changes,
          'updated_by', auth.uid()
        ),
        auth.uid()
      );
      
      INSERT INTO public.valoracion_security_logs (
        valoracion_id,
        action,
        details,
        severity,
        user_id
      ) VALUES (
        NEW.id,
        'valoracion_updated',
        jsonb_build_object(
          'changes', changes,
          'description', TRIM(change_description)
        ),
        'medium',
        auth.uid()
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Manejar DELETE (valoración eliminada)
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'valoracion_deleted',
      'high',
      'Valoración eliminada: ' || OLD.company_name,
      jsonb_build_object(
        'valoracion_id', OLD.id,
        'company_name', OLD.company_name,
        'status', OLD.status,
        'deleted_by', auth.uid()
      ),
      auth.uid()
    );
    
    INSERT INTO public.valoracion_security_logs (
      valoracion_id,
      action,
      details,
      severity,
      user_id
    ) VALUES (
      OLD.id,
      'valoracion_deleted',
      jsonb_build_object(
        'company_name', OLD.company_name,
        'status', OLD.status,
        'deleted_by', auth.uid()
      ),
      'high',
      auth.uid()
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear trigger para el audit
CREATE TRIGGER audit_valoracion_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.valoraciones
  FOR EACH ROW EXECUTE FUNCTION public.audit_valoracion_changes();

-- 4. Función para validar antes de insertar/actualizar valoraciones
CREATE OR REPLACE FUNCTION public.validate_valoracion_before_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar asociaciones si están definidas
  IF NEW.company_id IS NOT NULL OR NEW.contact_id IS NOT NULL THEN
    IF NOT public.validate_valoracion_associations(NEW.company_id, NEW.contact_id) THEN
      RAISE EXCEPTION 'Asociación inválida: La empresa o contacto no existe o no están correctamente relacionados';
    END IF;
  END IF;
  
  -- Sanitizar campos de texto
  NEW.company_name := TRIM(COALESCE(NEW.company_name, ''));
  NEW.client_name := TRIM(COALESCE(NEW.client_name, ''));
  NEW.company_description := TRIM(COALESCE(NEW.company_description, ''));
  
  -- Validar que los campos requeridos no estén vacíos
  IF NEW.company_name = '' THEN
    RAISE EXCEPTION 'El nombre de la empresa es requerido';
  END IF;
  
  IF NEW.client_name = '' THEN
    RAISE EXCEPTION 'El nombre del cliente es requerido';
  END IF;
  
  -- Validar honorarios
  IF NEW.fee_quoted IS NOT NULL AND NEW.fee_quoted < 0 THEN
    RAISE EXCEPTION 'El honorario cotizado no puede ser negativo';
  END IF;
  
  IF NEW.fee_charged IS NOT NULL AND NEW.fee_charged < 0 THEN
    RAISE EXCEPTION 'El honorario cobrado no puede ser negativo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger de validación
CREATE TRIGGER validate_valoracion_before_change_trigger
  BEFORE INSERT OR UPDATE ON public.valoraciones
  FOR EACH ROW EXECUTE FUNCTION public.validate_valoracion_before_change();

-- 6. Actualizar políticas RLS para considerar permisos cruzados
DROP POLICY IF EXISTS "Users can view valoraciones with entity access" ON public.valoraciones;
DROP POLICY IF EXISTS "Users can create valoraciones with entity validation" ON public.valoraciones;
DROP POLICY IF EXISTS "Users can update valoraciones with entity access" ON public.valoraciones;

-- Política de visualización con permisos cruzados mejorada
CREATE POLICY "Users can view valoraciones with cross-entity permissions"
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
    -- Usuario asignado puede ver la valoración
    assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Usuarios pueden ver valoraciones de empresas que crearon o poseen
    (company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid())
      AND company_status != 'inactive'
    ))
    OR
    -- Usuarios pueden ver valoraciones de contactos que crearon
    (contact_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = contact_id 
      AND created_by = auth.uid()
    ))
  );

-- Política de creación con validación de entidades
CREATE POLICY "Users can create valoraciones with entity validation"
  ON public.valoraciones
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    -- Solo si tienen acceso a la empresa (si está definida)
    (company_id IS NULL OR EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
      AND company_status != 'inactive'
    ))
    AND
    -- Solo si tienen acceso al contacto (si está definido)
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

-- Política de actualización con permisos cruzados
CREATE POLICY "Users can update valoraciones with cross-entity permissions"
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
    -- Puede actualizar si tiene permisos sobre la empresa actual
    (company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid())
      AND company_status != 'inactive'
    ))
  )
  WITH CHECK (
    -- Validar permisos sobre la nueva empresa (si cambia)
    (company_id IS NULL OR EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND (created_by = auth.uid() OR owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
      AND company_status != 'inactive'
    ))
    AND
    -- Validar permisos sobre el nuevo contacto (si cambia)
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

-- 7. Función para prevenir eliminación de empresas/contactos con valoraciones activas
CREATE OR REPLACE FUNCTION public.prevent_entity_delete_with_active_valoraciones()
RETURNS TRIGGER AS $$
BEGIN
  -- Para empresas
  IF TG_TABLE_NAME = 'companies' THEN
    IF EXISTS(
      SELECT 1 FROM public.valoraciones 
      WHERE company_id = OLD.id 
      AND status IN ('requested', 'in_process')
    ) THEN
      RAISE EXCEPTION 'No se puede eliminar la empresa porque tiene valoraciones activas. Complete o reasigne las valoraciones primero.';
    END IF;
  END IF;
  
  -- Para contactos
  IF TG_TABLE_NAME = 'contacts' THEN
    IF EXISTS(
      SELECT 1 FROM public.valoraciones 
      WHERE contact_id = OLD.id 
      AND status IN ('requested', 'in_process')
    ) THEN
      RAISE EXCEPTION 'No se puede eliminar el contacto porque tiene valoraciones activas. Complete o reasigne las valoraciones primero.';
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear triggers de prevención de eliminación
CREATE TRIGGER prevent_company_delete_with_valoraciones
  BEFORE DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION prevent_entity_delete_with_active_valoraciones();

CREATE TRIGGER prevent_contact_delete_with_valoraciones
  BEFORE DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION prevent_entity_delete_with_active_valoraciones();

-- 9. Índices para mejorar rendimiento de las consultas de permisos
CREATE INDEX IF NOT EXISTS idx_valoraciones_company_permissions 
ON public.valoraciones(company_id) WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_valoraciones_contact_permissions 
ON public.valoraciones(contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_valoraciones_assigned_permissions 
ON public.valoraciones(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_ownership 
ON public.companies(created_by, owner_id) WHERE company_status != 'inactive';

CREATE INDEX IF NOT EXISTS idx_contacts_ownership 
ON public.contacts(created_by);
