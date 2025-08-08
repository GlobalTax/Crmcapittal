-- FASE 1: INFRASTRUCTURE BASE - Workflows de Automatización (Corregido)
-- =====================================================================

-- 1. Crear enum para contact_classification si no existe
DO $$ BEGIN
  CREATE TYPE contact_classification AS ENUM ('lead', 'prospect', 'target', 'inversor', 'cliente', 'socio', 'otro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Función para calcular Contact Completeness Score (0-100)
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
  
  IF contact_record.location IS NOT NULL AND trim(contact_record.location) != '' THEN
    score := score + field_weight;
  END IF;
  
  IF contact_record.sectors_focus IS NOT NULL AND array_length(contact_record.sectors_focus, 1) > 0 THEN
    score := score + field_weight;
  END IF;
  
  -- Consentimiento y preferencias (10 puntos)
  IF (contact_record.channel_pref_email = true OR contact_record.channel_pref_phone = true OR contact_record.channel_pref_whatsapp = true) 
     AND contact_record.consent_date IS NOT NULL THEN
    score := score + field_weight;
  END IF;
  
  RETURN LEAST(score, max_score);
END;
$$;

-- 3. Función para calcular Company Completeness Score (0-100)
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

-- 4. Función para validar requisitos de consentimiento
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
  
  -- Verificar si tiene preferencias activas que requieren consentimiento
  IF contact_record.channel_pref_email = true THEN
    requires_consent := true;
    channels_requiring_consent := channels_requiring_consent || 'email';
  END IF;
  
  IF contact_record.channel_pref_phone = true THEN
    requires_consent := true;
    channels_requiring_consent := channels_requiring_consent || 'phone';
  END IF;
  
  IF contact_record.channel_pref_whatsapp = true THEN
    requires_consent := true;
    channels_requiring_consent := channels_requiring_consent || 'whatsapp';
  END IF;
  
  -- Si requiere consentimiento, verificar si lo tiene
  IF requires_consent THEN
    missing_consent := (contact_record.consent_date IS NULL);
  END IF;
  
  RETURN jsonb_build_object(
    'requires_consent', requires_consent,
    'missing_consent', missing_consent,
    'channels_requiring_consent', channels_requiring_consent,
    'consent_date', contact_record.consent_date,
    'consent_source', contact_record.consent_source
  );
END;
$$;

-- 5. Función para detectar contactos inactivos
CREATE OR REPLACE FUNCTION public.fn_detect_inactive_contacts(p_days_threshold integer DEFAULT 60)
RETURNS TABLE(
  contact_id uuid,
  contact_name text,
  contact_email text,
  company_name text,
  classification text,
  days_inactive integer,
  last_activity_date timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contact_id,
    c.name as contact_name,
    c.email as contact_email,
    COALESCE(comp.name, 'Sin empresa') as company_name,
    c.classification::text,
    EXTRACT(DAYS FROM NOW() - COALESCE(c.last_activity_date, c.created_at))::integer as days_inactive,
    COALESCE(c.last_activity_date, c.created_at) as last_activity_date
  FROM contacts c
  LEFT JOIN companies comp ON c.company_id = comp.id
  WHERE c.classification::text IN ('target', 'inversor')
  AND EXTRACT(DAYS FROM NOW() - COALESCE(c.last_activity_date, c.created_at)) >= p_days_threshold
  AND c.is_active = true
  ORDER BY days_inactive DESC;
END;
$$;

-- 6. Función para detectar inconsistencias contacto-empresa
CREATE OR REPLACE FUNCTION public.fn_detect_contact_company_inconsistencies()
RETURNS TABLE(
  contact_id uuid,
  contact_name text,
  contact_sectors text[],
  company_id uuid,
  company_name text,
  company_industry text,
  inconsistency_type text,
  suggested_action text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contact_id,
    c.name as contact_name,
    c.sectors_focus as contact_sectors,
    comp.id as company_id,
    comp.name as company_name,
    comp.industry as company_industry,
    CASE 
      WHEN c.sectors_focus IS NOT NULL 
           AND comp.industry IS NOT NULL 
           AND NOT (comp.industry = ANY(c.sectors_focus))
      THEN 'sector_mismatch'
      WHEN c.sectors_focus IS NULL AND comp.industry IS NOT NULL
      THEN 'missing_contact_sectors'
      WHEN c.sectors_focus IS NOT NULL AND comp.industry IS NULL
      THEN 'missing_company_industry'
      ELSE 'unknown'
    END as inconsistency_type,
    CASE 
      WHEN c.sectors_focus IS NOT NULL 
           AND comp.industry IS NOT NULL 
           AND NOT (comp.industry = ANY(c.sectors_focus))
      THEN 'Ajustar sectors_focus del contacto o industry de la empresa'
      WHEN c.sectors_focus IS NULL AND comp.industry IS NOT NULL
      THEN 'Añadir sectors_focus al contacto basado en la industria de la empresa'
      WHEN c.sectors_focus IS NOT NULL AND comp.industry IS NULL
      THEN 'Añadir industry a la empresa basado en sectors_focus del contacto'
      ELSE 'Revisar manualmente'
    END as suggested_action
  FROM contacts c
  INNER JOIN companies comp ON c.company_id = comp.id
  WHERE (
    -- Sectores del contacto no coinciden con industria de empresa
    (c.sectors_focus IS NOT NULL 
     AND comp.industry IS NOT NULL 
     AND NOT (comp.industry = ANY(c.sectors_focus)))
    OR
    -- Contacto sin sectores pero empresa con industria
    (c.sectors_focus IS NULL AND comp.industry IS NOT NULL)
    OR
    -- Contacto con sectores pero empresa sin industria
    (c.sectors_focus IS NOT NULL AND comp.industry IS NULL)
  );
END;
$$;

-- 7. Crear tablas para tareas de contactos y empresas si no existen
CREATE TABLE IF NOT EXISTS public.contact_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  assigned_to uuid,
  priority text DEFAULT 'medium'::text,
  status text DEFAULT 'pending'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  assigned_to uuid,
  priority text DEFAULT 'medium'::text,
  status text DEFAULT 'pending'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 8. Función para crear tareas automáticas de workflow
CREATE OR REPLACE FUNCTION public.fn_create_workflow_task(
  p_entity_type text,
  p_entity_id uuid,
  p_task_type text,
  p_title text,
  p_description text DEFAULT NULL,
  p_due_days integer DEFAULT 7,
  p_assigned_to uuid DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  task_id uuid;
  due_date timestamp with time zone;
  assigned_user uuid;
BEGIN
  -- Calcular fecha de vencimiento
  due_date := now() + (p_due_days || ' days')::interval;
  
  -- Determinar usuario asignado
  assigned_user := COALESCE(p_assigned_to, auth.uid());
  
  -- Crear la tarea según el tipo de entidad
  CASE p_entity_type
    WHEN 'contact' THEN
      INSERT INTO public.contact_tasks (
        contact_id,
        task_type,
        title,
        description,
        due_date,
        assigned_to,
        priority,
        status,
        metadata,
        created_by
      ) VALUES (
        p_entity_id,
        p_task_type,
        p_title,
        p_description,
        due_date,
        assigned_user,
        p_priority,
        'pending',
        p_metadata,
        auth.uid()
      ) RETURNING id INTO task_id;
      
    WHEN 'company' THEN
      INSERT INTO public.company_tasks (
        company_id,
        task_type,
        title,
        description,
        due_date,
        assigned_to,
        priority,
        status,
        metadata,
        created_by
      ) VALUES (
        p_entity_id,
        p_task_type,
        p_title,
        p_description,
        due_date,
        assigned_user,
        p_priority,
        'pending',
        p_metadata,
        auth.uid()
      ) RETURNING id INTO task_id;
      
    ELSE
      RAISE EXCEPTION 'Tipo de entidad no soportado: %', p_entity_type;
  END CASE;
  
  -- Log de la automatización
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
    'workflow_task_created',
    'automated_workflow',
    p_entity_type,
    p_entity_id,
    'Tarea automática creada: ' || p_title,
    'success',
    jsonb_build_object(
      'task_id', task_id,
      'task_type', p_task_type,
      'due_date', due_date,
      'assigned_to', assigned_user
    ),
    auth.uid()
  );
  
  RETURN task_id;
END;
$$;

-- RLS para las nuevas tablas
ALTER TABLE public.contact_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contact_tasks
DROP POLICY IF EXISTS "Users can manage contact tasks" ON public.contact_tasks;
CREATE POLICY "Users can manage contact tasks" ON public.contact_tasks
FOR ALL USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Políticas RLS para company_tasks
DROP POLICY IF EXISTS "Users can manage company tasks" ON public.company_tasks;
CREATE POLICY "Users can manage company tasks" ON public.company_tasks
FOR ALL USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contact_tasks_contact_id ON contact_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tasks_assigned_to ON contact_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_tasks_due_date ON contact_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_contact_tasks_status ON contact_tasks(status);

CREATE INDEX IF NOT EXISTS idx_company_tasks_company_id ON company_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tasks_assigned_to ON company_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_company_tasks_due_date ON company_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_company_tasks_status ON company_tasks(status);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_contact_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_company_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_contact_tasks_updated_at ON contact_tasks;
CREATE TRIGGER update_contact_tasks_updated_at
  BEFORE UPDATE ON contact_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_tasks_updated_at();

DROP TRIGGER IF EXISTS update_company_tasks_updated_at ON company_tasks;
CREATE TRIGGER update_company_tasks_updated_at
  BEFORE UPDATE ON company_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_company_tasks_updated_at();

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
  'workflow_infrastructure',
  'migration_completed',
  'system',
  gen_random_uuid(),
  'Infraestructura de workflows implementada',
  'success',
  jsonb_build_object(
    'phase', 'step_1_infrastructure',
    'timestamp', now(),
    'functions_created', 6,
    'tables_created', 2,
    'triggers_created', 2
  )
);