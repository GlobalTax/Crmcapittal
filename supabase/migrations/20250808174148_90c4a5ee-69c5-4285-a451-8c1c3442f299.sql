-- WORKFLOWS DE AUTOMATIZACIÓN - Implementación Final
-- =====================================================================

-- 1. Función para calcular Contact Completeness Score (0-100) - CORREGIDA
CREATE OR REPLACE FUNCTION public.fn_calculate_contact_completeness_score(p_contact_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_record RECORD;
  score INTEGER := 0;
  max_score INTEGER := 100;
  field_weight INTEGER := 10; -- Cada campo vale 10 puntos
BEGIN
  SELECT * INTO contact_record FROM contacts WHERE id = p_contact_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Campos básicos (10 puntos cada uno)
  IF contact_record.name IS NOT NULL AND trim(contact_record.name) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.email IS NOT NULL AND contact_record.email ~ '^[^@]+@[^@]+\.[^@]+$' THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.phone_normalized IS NOT NULL AND trim(contact_record.phone_normalized) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.company_id IS NOT NULL THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.position IS NOT NULL AND trim(contact_record.position) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.classification IS NOT NULL THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.linkedin_url IS NOT NULL AND trim(contact_record.linkedin_url) != '' THEN
    score := score + field_weight;
  END IF;
  
  -- Usar geography_focus en lugar de location
  IF contact_record.geography_focus IS NOT NULL AND array_length(contact_record.geography_focus, 1) > 0 THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.sectors_focus IS NOT NULL AND array_length(contact_record.sectors_focus, 1) > 0 THEN
    score := score + field_weight;
  END IF;
  
  -- Consentimiento (usar campos que existen: consent_email, consent_whatsapp)
  IF (contact_record.consent_email = true OR contact_record.consent_whatsapp = true) THEN
    score := score + field_weight;
  END IF;
  
  RETURN LEAST(score, max_score);
END;
$$;

-- 2. Función para calcular Company Completeness Score (0-100) - CORREGIDA
CREATE OR REPLACE FUNCTION public.fn_calculate_company_completeness_score(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_record RECORD;
  score INTEGER := 0;
  max_score INTEGER := 100;
  field_weight INTEGER := 10; -- Cada campo vale 10 puntos
BEGIN
  SELECT * INTO company_record FROM companies WHERE id = p_company_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Campos básicos (10 puntos cada uno)
  IF company_record.name_normalized IS NOT NULL AND trim(company_record.name_normalized) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.domain IS NOT NULL AND trim(company_record.domain) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.industry IS NOT NULL AND trim(company_record.industry) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.company_size IS NOT NULL AND trim(company_record.company_size) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.country IS NOT NULL AND trim(company_record.country) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.revenue_band IS NOT NULL AND trim(company_record.revenue_band) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.ebitda_band IS NOT NULL AND trim(company_record.ebitda_band) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.website IS NOT NULL AND trim(company_record.website) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.description IS NOT NULL AND trim(company_record.description) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF company_record.phone IS NOT NULL AND trim(company_record.phone) != '' THEN
    score := score + field_weight;
  END IF;
  
  RETURN LEAST(score, max_score);
END;
$$;

-- 3. Función para validar requisitos de consentimiento - CORREGIDA
CREATE OR REPLACE FUNCTION public.fn_check_consent_requirements(p_contact_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_record RECORD;
  requires_consent BOOLEAN := false;
  missing_consent BOOLEAN := false;
  channels_requiring_consent TEXT[] := ARRAY[]::TEXT[];
BEGIN
  SELECT * INTO contact_record FROM contacts WHERE id = p_contact_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Contact not found');
  END IF;
  
  -- Verificar preferencias de canal (usar campos reales)
  IF contact_record.channel_pref IS NOT NULL AND contact_record.channel_pref != '' THEN
    requires_consent := true;
    IF contact_record.channel_pref ILIKE '%email%' THEN
      channels_requiring_consent := channels_requiring_consent || 'email';
      missing_consent := missing_consent OR (contact_record.consent_email = false);
    END IF;
    IF contact_record.channel_pref ILIKE '%whatsapp%' THEN
      channels_requiring_consent := channels_requiring_consent || 'whatsapp';
      missing_consent := missing_consent OR (contact_record.consent_whatsapp = false);
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'requires_consent', requires_consent,
    'missing_consent', missing_consent,
    'channels_requiring_consent', channels_requiring_consent,
    'consent_email', contact_record.consent_email,
    'consent_whatsapp', contact_record.consent_whatsapp
  );
END;
$$;

-- 4. Añadir campos de completeness score si no existen
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;

-- 5. Crear workflow básico para contactos - SIMPLIFICADO
CREATE OR REPLACE FUNCTION public.simple_contact_workflow(p_contact_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_score INTEGER;
  consent_check JSONB;
  tasks_created INTEGER := 0;
  current_user_id UUID;
BEGIN
  -- Usar get user si está disponible, sino null
  BEGIN
    SELECT auth.uid() INTO current_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      current_user_id := NULL;
  END;
  
  -- Calcular score
  contact_score := public.fn_calculate_contact_completeness_score(p_contact_id);
  
  -- Actualizar score en la tabla
  UPDATE contacts SET completeness_score = contact_score WHERE id = p_contact_id;
  
  -- Verificar consentimiento
  consent_check := public.fn_check_consent_requirements(p_contact_id);
  
  -- Si score < 70, crear tarea (solo si no existe)
  IF contact_score < 70 AND NOT EXISTS (
    SELECT 1 FROM contact_tasks 
    WHERE contact_id = p_contact_id 
    AND title ILIKE '%completar perfil%'
  ) THEN
    INSERT INTO contact_tasks (
      contact_id, title, description, due_date, 
      priority, completed, created_by
    ) VALUES (
      p_contact_id,
      'Completar perfil de contacto',
      format('Score actual: %s/100. Faltan campos por completar.', contact_score),
      now() + interval '3 days',
      'high',
      false,
      current_user_id
    );
    
    tasks_created := tasks_created + 1;
  END IF;
  
  -- Si falta consentimiento, crear tarea
  IF (consent_check->>'missing_consent')::boolean = true AND NOT EXISTS (
    SELECT 1 FROM contact_tasks 
    WHERE contact_id = p_contact_id 
    AND title ILIKE '%consentimiento%'
  ) THEN
    INSERT INTO contact_tasks (
      contact_id, title, description, due_date, 
      priority, completed, created_by
    ) VALUES (
      p_contact_id,
      'Solicitar consentimiento GDPR',
      format('Canales activos requieren consentimiento: %s', consent_check->>'channels_requiring_consent'),
      now() + interval '1 day',
      'high',
      false,
      current_user_id
    );
    
    tasks_created := tasks_created + 1;
  END IF;
  
  RETURN jsonb_build_object(
    'contact_id', p_contact_id,
    'score', contact_score,
    'consent_check', consent_check,
    'tasks_created', tasks_created
  );
END;
$$;

-- 6. Función similar para empresas - SIMPLIFICADA
CREATE OR REPLACE FUNCTION public.simple_company_workflow(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_score INTEGER;
  tasks_created INTEGER := 0;
  current_user_id UUID;
BEGIN
  -- Usar get user si está disponible, sino null
  BEGIN
    SELECT auth.uid() INTO current_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      current_user_id := NULL;
  END;
  
  -- Calcular score
  company_score := public.fn_calculate_company_completeness_score(p_company_id);
  
  -- Actualizar score en la tabla
  UPDATE companies SET completeness_score = company_score WHERE id = p_company_id;
  
  -- Si score < 70, crear tarea (solo si no existe en company_tasks)
  IF company_score < 70 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_tasks') 
     AND NOT EXISTS (
    SELECT 1 FROM company_tasks 
    WHERE company_id = p_company_id 
    AND title ILIKE '%completar perfil%'
  ) THEN
    INSERT INTO company_tasks (
      company_id, task_type, title, description, due_date, 
      priority, task_status, created_by
    ) VALUES (
      p_company_id,
      'completar_perfil',
      'Completar perfil de empresa',
      format('Score actual: %s/100. Considerar enriquecimiento con eInforma.', company_score),
      now() + interval '5 days',
      'medium',
      'pending',
      current_user_id
    );
    
    tasks_created := tasks_created + 1;
  END IF;
  
  RETURN jsonb_build_object(
    'company_id', p_company_id,
    'score', company_score,
    'tasks_created', tasks_created
  );
END;
$$;

-- 7. Calcular scores para datos existentes (muestra limitada)
UPDATE contacts 
SET completeness_score = public.fn_calculate_contact_completeness_score(id)
WHERE id IN (SELECT id FROM contacts LIMIT 50);

UPDATE companies 
SET completeness_score = public.fn_calculate_company_completeness_score(id)
WHERE id IN (SELECT id FROM companies LIMIT 25);

-- 8. Log de implementación exitosa
INSERT INTO public.automation_logs (
  automation_type,
  trigger_event,
  entity_type,
  entity_id,
  action_taken,
  status,
  action_data
) VALUES (
  'workflow_implementation_final',
  'migration_completed',
  'system',
  gen_random_uuid(),
  'Workflows de automatización implementados exitosamente',
  'success',
  jsonb_build_object(
    'phase', 'workflows_complete_final',
    'timestamp', now(),
    'functions_created', 5,
    'fields_added', 2,
    'approach', 'simplified_robust_workflow',
    'contact_fields_used', ARRAY['name', 'email', 'phone_normalized', 'company_id', 'position', 'classification', 'linkedin_url', 'geography_focus', 'sectors_focus', 'consent_email', 'consent_whatsapp'],
    'company_fields_used', ARRAY['name_normalized', 'domain', 'industry', 'company_size', 'country', 'revenue_band', 'ebitda_band', 'website', 'description', 'phone']
  )
);