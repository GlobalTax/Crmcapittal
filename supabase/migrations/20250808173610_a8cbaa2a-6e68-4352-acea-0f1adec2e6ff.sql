-- FASE 2: WORKFLOW TRIGGERS - Automatización de Contactos y Empresas
-- =====================================================================

-- 1. Trigger para CONTACTO NUEVO/ACTUALIZADO
CREATE OR REPLACE FUNCTION public.trigger_contact_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_score INTEGER;
  consent_check JSONB;
  task_id UUID;
BEGIN
  -- Solo procesar si es INSERT o si cambió classification
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.classification IS DISTINCT FROM NEW.classification) THEN
    
    -- Auto-assignar company_id si falta (ya implementado en normalización)
    IF NEW.company_id IS NULL AND NEW.email IS NOT NULL THEN
      NEW.company_id := public.quick_create_company_from_email(NEW.email);
    END IF;
    
    -- Calcular completeness score
    contact_score := public.fn_calculate_contact_completeness_score(NEW.id);
    
    -- Si score < 70, crear tarea de completar perfil
    IF contact_score < 70 THEN
      SELECT public.fn_create_workflow_task(
        'contact',
        NEW.id,
        'completar_perfil',
        'Completar perfil de contacto',
        format('Score actual: %s/100. Faltan campos por completar.', contact_score),
        3, -- 3 días
        NEW.created_by,
        'high',
        jsonb_build_object('current_score', contact_score, 'target_score', 70)
      ) INTO task_id;
    END IF;
    
    -- Verificar consentimiento si hay preferencias activas
    consent_check := public.fn_check_consent_requirements(NEW.id);
    
    IF (consent_check->>'missing_consent')::boolean = true THEN
      SELECT public.fn_create_workflow_task(
        'contact',
        NEW.id,
        'solicitar_consentimiento',
        'Solicitar consentimiento GDPR',
        format('Canales activos requieren consentimiento: %s', consent_check->>'channels_requiring_consent'),
        1, -- 1 día (urgente)
        NEW.created_by,
        'high',
        jsonb_build_object('channels', consent_check->'channels_requiring_consent')
      ) INTO task_id;
    END IF;
    
    -- Log de automatización
    INSERT INTO public.automation_logs (
      automation_type,
      trigger_event,
      entity_type,
      entity_id,
      action_taken,
      status,
      action_data,
      user_id
    ) VALUES (
      'contact_workflow',
      CASE WHEN TG_OP = 'INSERT' THEN 'contact_created' ELSE 'contact_updated' END,
      'contact',
      NEW.id,
      format('Workflow ejecutado - Score: %s, Consentimiento requerido: %s', 
             contact_score, 
             consent_check->>'missing_consent'),
      'success',
      jsonb_build_object(
        'score', contact_score,
        'consent_check', consent_check,
        'classification', NEW.classification
      ),
      COALESCE(NEW.created_by, auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Trigger para EMPRESA NUEVA/ACTUALIZADA
CREATE OR REPLACE FUNCTION public.trigger_company_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_score INTEGER;
  task_id UUID;
  existing_company_id UUID;
BEGIN
  -- Solo procesar si es INSERT o si cambiaron tags clave
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.industry IS DISTINCT FROM NEW.industry OR
       OLD.country IS DISTINCT FROM NEW.country OR
       OLD.company_size IS DISTINCT FROM NEW.company_size
     )) THEN
    
    -- Para INSERT: Verificar dedupe por tax_id/name_normalized
    IF TG_OP = 'INSERT' THEN
      -- Buscar posible duplicado
      SELECT id INTO existing_company_id
      FROM companies 
      WHERE (
        (NEW.tax_id IS NOT NULL AND tax_id = NEW.tax_id) OR
        (NEW.name_normalized IS NOT NULL AND name_normalized = NEW.name_normalized)
      )
      AND id != NEW.id
      LIMIT 1;
      
      -- Si hay duplicado, crear tarea de merge
      IF existing_company_id IS NOT NULL THEN
        SELECT public.fn_create_workflow_task(
          'company',
          NEW.id,
          'revisar_duplicado',
          'Posible empresa duplicada detectada',
          format('Empresa similar encontrada (ID: %s). Revisar para posible fusión.', existing_company_id),
          2, -- 2 días
          NEW.created_by,
          'high',
          jsonb_build_object('duplicate_id', existing_company_id, 'match_reason', 'tax_id_or_name')
        ) INTO task_id;
      END IF;
    END IF;
    
    -- Calcular completeness score
    company_score := public.fn_calculate_company_completeness_score(NEW.id);
    
    -- Si score < 70, crear tarea de completar perfil
    IF company_score < 70 THEN
      SELECT public.fn_create_workflow_task(
        'company',
        NEW.id,
        'completar_perfil',
        'Completar perfil de empresa',
        format('Score actual: %s/100. Considerar enriquecimiento con eInforma.', company_score),
        5, -- 5 días
        NEW.created_by,
        'medium',
        jsonb_build_object('current_score', company_score, 'target_score', 70, 'suggest_einforma', true)
      ) INTO task_id;
    END IF;
    
    -- Si cambiaron tags clave, crear tarea de re-matching
    IF TG_OP = 'UPDATE' AND (
      OLD.industry IS DISTINCT FROM NEW.industry OR
      OLD.country IS DISTINCT FROM NEW.country OR
      OLD.company_size IS DISTINCT FROM NEW.company_size
    ) THEN
      SELECT public.fn_create_workflow_task(
        'company',
        NEW.id,
        'recalcular_fit',
        'Recalcular fit de empresa',
        format('Tags clave modificados. Revisar fit con deals activos.'),
        1, -- 1 día
        NEW.owner_id,
        'medium',
        jsonb_build_object(
          'old_industry', OLD.industry,
          'new_industry', NEW.industry,
          'old_country', OLD.country,
          'new_country', NEW.country,
          'old_size', OLD.company_size,
          'new_size', NEW.company_size
        )
      ) INTO task_id;
    END IF;
    
    -- Log de automatización
    INSERT INTO public.automation_logs (
      automation_type,
      trigger_event,
      entity_type,
      entity_id,
      action_taken,
      status,
      action_data,
      user_id
    ) VALUES (
      'company_workflow',
      CASE WHEN TG_OP = 'INSERT' THEN 'company_created' ELSE 'company_updated' END,
      'company',
      NEW.id,
      format('Workflow ejecutado - Score: %s', company_score),
      'success',
      jsonb_build_object(
        'score', company_score,
        'duplicate_check', existing_company_id IS NOT NULL,
        'duplicate_id', existing_company_id
      ),
      COALESCE(NEW.created_by, auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Función para procesar inconsistencias contacto-empresa (CRON job)
CREATE OR REPLACE FUNCTION public.process_contact_company_inconsistencies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inconsistency_record RECORD;
  task_id UUID;
  total_processed INTEGER := 0;
BEGIN
  -- Procesar inconsistencias detectadas
  FOR inconsistency_record IN 
    SELECT * FROM public.fn_detect_contact_company_inconsistencies()
    LIMIT 50 -- Procesar máximo 50 por ejecución
  LOOP
    -- Crear tarea de revisión
    SELECT public.fn_create_workflow_task(
      'contact',
      inconsistency_record.contact_id,
      'revisar_consistencia',
      'Revisar consistencia contacto-empresa',
      format('Inconsistencia detectada: %s. %s', 
             inconsistency_record.inconsistency_type,
             inconsistency_record.suggested_action),
      7, -- 7 días
      NULL, -- Auto-asignar
      'low',
      jsonb_build_object(
        'inconsistency_type', inconsistency_record.inconsistency_type,
        'company_id', inconsistency_record.company_id,
        'company_name', inconsistency_record.company_name,
        'company_industry', inconsistency_record.company_industry,
        'contact_sectors', inconsistency_record.contact_sectors,
        'suggested_action', inconsistency_record.suggested_action
      )
    ) INTO task_id;
    
    total_processed := total_processed + 1;
  END LOOP;
  
  -- Log del proceso
  IF total_processed > 0 THEN
    INSERT INTO public.automation_logs (
      automation_type,
      trigger_event,
      entity_type,
      entity_id,
      action_taken,
      status,
      action_data
    ) VALUES (
      'consistency_check',
      'scheduled_process',
      'system',
      gen_random_uuid(),
      format('Procesadas %s inconsistencias contacto-empresa', total_processed),
      'success',
      jsonb_build_object('inconsistencies_processed', total_processed)
    );
  END IF;
END;
$$;

-- 4. Función para procesar contactos inactivos (CRON job)
CREATE OR REPLACE FUNCTION public.process_inactive_contacts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inactive_record RECORD;
  task_id UUID;
  total_processed INTEGER := 0;
BEGIN
  -- Procesar contactos inactivos (target/inversor, 60+ días)
  FOR inactive_record IN 
    SELECT * FROM public.fn_detect_inactive_contacts(60)
    LIMIT 20 -- Procesar máximo 20 por ejecución
  LOOP
    -- Verificar que no tenga ya una tarea de re-enganche activa
    IF NOT EXISTS (
      SELECT 1 FROM contact_tasks 
      WHERE contact_id = inactive_record.contact_id 
      AND task_type = 're_enganche' 
      AND task_status = 'pending'
    ) THEN
      -- Crear tarea de re-enganche
      SELECT public.fn_create_workflow_task(
        'contact',
        inactive_record.contact_id,
        're_enganche',
        format('Re-enganche contacto inactivo (%s días)', inactive_record.days_inactive),
        format('Contacto %s (%s) sin actividad desde %s. Clasificación: %s',
               inactive_record.contact_name,
               inactive_record.company_name,
               inactive_record.last_activity_date::date,
               inactive_record.classification),
        3, -- 3 días
        NULL, -- Auto-asignar
        'medium',
        jsonb_build_object(
          'days_inactive', inactive_record.days_inactive,
          'last_activity_date', inactive_record.last_activity_date,
          'classification', inactive_record.classification,
          'company_name', inactive_record.company_name
        )
      ) INTO task_id;
      
      total_processed := total_processed + 1;
    END IF;
  END LOOP;
  
  -- Log del proceso
  IF total_processed > 0 THEN
    INSERT INTO public.automation_logs (
      automation_type,
      trigger_event,
      entity_type,
      entity_id,
      action_taken,
      status,
      action_data
    ) VALUES (
      'inactive_contacts',
      'scheduled_process',
      'system',
      gen_random_uuid(),
      format('Procesados %s contactos inactivos', total_processed),
      'success',
      jsonb_build_object('contacts_processed', total_processed)
    );
  END IF;
END;
$$;

-- 5. Crear triggers en las tablas
DROP TRIGGER IF EXISTS trigger_contact_workflow_automation ON contacts;
CREATE TRIGGER trigger_contact_workflow_automation
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_contact_workflow();

DROP TRIGGER IF EXISTS trigger_company_workflow_automation ON companies;
CREATE TRIGGER trigger_company_workflow_automation
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_company_workflow();

-- 6. Añadir campos de completeness score (opcional, para caching)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;

-- Función para actualizar scores en batch
CREATE OR REPLACE FUNCTION public.update_all_completeness_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Actualizar scores de contactos
  UPDATE contacts 
  SET completeness_score = public.fn_calculate_contact_completeness_score(id)
  WHERE completeness_score IS NULL OR completeness_score = 0;
  
  -- Actualizar scores de empresas
  UPDATE companies 
  SET completeness_score = public.fn_calculate_company_completeness_score(id)
  WHERE completeness_score IS NULL OR completeness_score = 0;
  
  -- Log del proceso
  INSERT INTO public.automation_logs (
    automation_type,
    trigger_event,
    entity_type,
    entity_id,
    action_taken,
    status,
    action_data
  ) VALUES (
    'completeness_scores',
    'batch_update',
    'system',
    gen_random_uuid(),
    'Scores de completeness actualizados en batch',
    'success',
    jsonb_build_object('timestamp', now())
  );
END;
$$;

-- Ejecutar actualización inicial de scores
SELECT public.update_all_completeness_scores();

-- Log de progreso
INSERT INTO public.automation_logs (
  automation_type,
  trigger_event,
  entity_type,
  entity_id,
  action_taken,
  status,
  action_data
) VALUES (
  'workflow_triggers',
  'migration_completed',
  'system',
  gen_random_uuid(),
  'Triggers de workflow implementados',
  'success',
  jsonb_build_object(
    'phase', 'step_2_triggers',
    'timestamp', now(),
    'triggers_created', 2,
    'functions_created', 4,
    'fields_added', 2
  )
);