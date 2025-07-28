-- Funciones para automatización de cambios de stage en leads

-- Función para crear tareas automáticas
CREATE OR REPLACE FUNCTION public.create_lead_task(
  p_lead_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_assigned_to UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO public.lead_tasks (
    lead_id,
    title,
    description,
    due_date,
    priority,
    assigned_to,
    status,
    created_by
  ) VALUES (
    p_lead_id,
    p_title,
    p_description,
    p_due_date,
    p_priority,
    p_assigned_to,
    'pending',
    auth.uid()
  ) RETURNING id INTO task_id;
  
  RETURN task_id;
END;
$function$;

-- Función para crear propuesta desde lead
CREATE OR REPLACE FUNCTION public.create_proposal_from_lead(
  p_lead_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  proposal_id UUID;
  lead_record RECORD;
  contact_record RECORD;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM public.leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  -- Crear propuesta
  INSERT INTO public.proposals (
    title,
    contact_id,
    company_id,
    status,
    proposal_type,
    created_by,
    total_amount,
    currency
  ) VALUES (
    'Propuesta para ' || COALESCE(lead_record.name, lead_record.email),
    lead_record.contact_id,
    lead_record.company_id,
    'draft',
    'service',
    auth.uid(),
    COALESCE(lead_record.budget_range::NUMERIC, 0),
    'EUR'
  ) RETURNING id INTO proposal_id;
  
  -- Registrar actividad
  INSERT INTO public.lead_activities (
    lead_id,
    activity_type,
    title,
    description,
    activity_data,
    created_by
  ) VALUES (
    p_lead_id,
    'proposal_created',
    'Propuesta creada automáticamente',
    'Se ha generado una propuesta en estado draft al mover el lead a etapa Propuesta',
    jsonb_build_object('proposal_id', proposal_id, 'automated', true),
    auth.uid()
  );
  
  RETURN proposal_id;
END;
$function$;

-- Función para crear company y deal desde lead ganado
CREATE OR REPLACE FUNCTION public.create_deal_from_won_lead(
  p_lead_id UUID,
  p_deal_value NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record RECORD;
  company_id UUID;
  contact_id UUID;
  deal_id UUID;
  stage_id UUID;
  result JSONB;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM public.leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  -- Crear o usar company existente
  IF lead_record.company_id IS NOT NULL THEN
    company_id := lead_record.company_id;
  ELSE
    -- Crear nueva company
    INSERT INTO public.companies (
      name,
      email,
      phone,
      industry,
      company_status,
      lifecycle_stage,
      created_by,
      owner_id
    ) VALUES (
      COALESCE(lead_record.company, lead_record.name),
      lead_record.email,
      lead_record.phone,
      lead_record.sector,
      'cliente',
      'cliente',
      auth.uid(),
      lead_record.assigned_to_id
    ) RETURNING id INTO company_id;
    
    -- Actualizar lead con company_id
    UPDATE public.leads 
    SET company_id = company_id, updated_at = now()
    WHERE id = p_lead_id;
  END IF;
  
  -- Crear o usar contact existente
  IF lead_record.contact_id IS NOT NULL THEN
    contact_id := lead_record.contact_id;
  ELSE
    -- Crear nuevo contact
    INSERT INTO public.contacts (
      name,
      email,
      phone,
      company_id,
      contact_type,
      lifecycle_stage,
      created_by
    ) VALUES (
      lead_record.name,
      lead_record.email,
      lead_record.phone,
      company_id,
      'client',
      'cliente',
      auth.uid()
    ) RETURNING id INTO contact_id;
    
    -- Actualizar lead con contact_id
    UPDATE public.leads 
    SET contact_id = contact_id, updated_at = now()
    WHERE id = p_lead_id;
  END IF;
  
  -- Obtener stage "Won" o crear si no existe
  SELECT id INTO stage_id 
  FROM public.stages 
  WHERE LOWER(name) = 'won' OR LOWER(name) = 'ganado'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF stage_id IS NULL THEN
    -- Crear stage Won si no existe
    INSERT INTO public.stages (name, color, order_index, pipeline_id)
    SELECT 'Won', '#22c55e', 99, id
    FROM public.pipelines 
    WHERE type = 'DEAL'
    LIMIT 1
    RETURNING id INTO stage_id;
  END IF;
  
  -- Crear deal
  INSERT INTO public.deals (
    title,
    contact_id,
    company_id,
    stage_id,
    value,
    currency,
    probability,
    expected_close_date,
    source,
    created_by,
    assigned_to
  ) VALUES (
    'Deal - ' || lead_record.name,
    contact_id,
    company_id,
    stage_id,
    COALESCE(p_deal_value, lead_record.budget_range::NUMERIC, 0),
    'EUR',
    100,
    CURRENT_DATE + INTERVAL '30 days',
    lead_record.source,
    auth.uid(),
    lead_record.assigned_to_id
  ) RETURNING id INTO deal_id;
  
  -- Actualizar lead como ganado
  UPDATE public.leads 
  SET 
    won_date = now(),
    deal_value = COALESCE(p_deal_value, lead_record.budget_range::NUMERIC),
    updated_at = now()
  WHERE id = p_lead_id;
  
  -- Registrar actividad
  INSERT INTO public.lead_activities (
    lead_id,
    activity_type,
    title,
    description,
    activity_data,
    created_by
  ) VALUES (
    p_lead_id,
    'won_conversion',
    'Lead convertido a cliente',
    'Se han creado automáticamente company, contact y deal al marcar el lead como ganado',
    jsonb_build_object(
      'company_id', company_id,
      'contact_id', contact_id, 
      'deal_id', deal_id,
      'automated', true
    ),
    auth.uid()
  );
  
  -- Construir resultado
  result := jsonb_build_object(
    'success', true,
    'company_id', company_id,
    'contact_id', contact_id,
    'deal_id', deal_id
  );
  
  RETURN result;
END;
$function$;

-- Función principal para manejar cambios de stage
CREATE OR REPLACE FUNCTION public.handle_lead_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_stage_name TEXT;
  new_stage_name TEXT;
  task_id UUID;
  proposal_id UUID;
  deal_result JSONB;
BEGIN
  -- Solo procesar si cambió el stage
  IF OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id THEN
    
    -- Obtener nombres de stages
    SELECT name INTO old_stage_name 
    FROM public.pipeline_stages 
    WHERE id = OLD.pipeline_stage_id;
    
    SELECT name INTO new_stage_name 
    FROM public.pipeline_stages 
    WHERE id = NEW.pipeline_stage_id;
    
    -- Validar lost_reason para stage "Perdido"
    IF LOWER(new_stage_name) IN ('perdido', 'lost', 'descalificado') THEN
      IF NEW.lost_reason IS NULL OR TRIM(NEW.lost_reason) = '' THEN
        RAISE EXCEPTION 'El campo lost_reason es obligatorio cuando se mueve un lead a estado Perdido';
      END IF;
      
      -- Marcar fecha de pérdida
      NEW.lost_date := now();
    END IF;
    
    -- Automatización: Pipeline → Cualificado
    IF LOWER(new_stage_name) IN ('cualificado', 'qualified') THEN
      task_id := public.create_lead_task(
        NEW.id,
        'Preparar propuesta',
        'Preparar y enviar propuesta comercial al prospecto cualificado',
        now() + INTERVAL '3 days',
        'high',
        COALESCE(NEW.assigned_to_id, auth.uid())
      );
      
      RAISE NOTICE 'Tarea creada automáticamente para lead cualificado: %', task_id;
    END IF;
    
    -- Automatización: Cualificado → Propuesta
    IF LOWER(new_stage_name) IN ('propuesta', 'proposal') THEN
      proposal_id := public.create_proposal_from_lead(NEW.id);
      RAISE NOTICE 'Propuesta creada automáticamente: %', proposal_id;
    END IF;
    
    -- Automatización: Negociación → Ganado
    IF LOWER(new_stage_name) IN ('ganado', 'won', 'cerrado') THEN
      deal_result := public.create_deal_from_won_lead(NEW.id, NEW.deal_value);
      RAISE NOTICE 'Deal creado automáticamente: %', deal_result;
    END IF;
    
    -- Registrar cambio de stage en actividades
    INSERT INTO public.lead_activities (
      lead_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'stage_changed',
      'Cambio de etapa del lead',
      'Lead movido de "' || COALESCE(old_stage_name, 'N/A') || '" a "' || COALESCE(new_stage_name, 'N/A') || '"',
      jsonb_build_object(
        'old_stage', old_stage_name,
        'new_stage', new_stage_name,
        'old_stage_id', OLD.pipeline_stage_id,
        'new_stage_id', NEW.pipeline_stage_id
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear trigger para automatización de stages
DROP TRIGGER IF EXISTS trigger_lead_stage_automation ON public.leads;

CREATE TRIGGER trigger_lead_stage_automation
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lead_stage_change();

-- Agregar tabla para tareas de leads si no existe
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para lead_tasks
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create lead tasks" ON public.lead_tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view lead tasks" ON public.lead_tasks
  FOR SELECT USING (
    auth.uid() = created_by 
    OR auth.uid() = assigned_to
    OR EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can update lead tasks" ON public.lead_tasks
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR auth.uid() = assigned_to
  );

CREATE POLICY "Users can delete their own lead tasks" ON public.lead_tasks
  FOR DELETE USING (auth.uid() = created_by);

-- Trigger para updated_at en lead_tasks
CREATE TRIGGER update_lead_tasks_updated_at
  BEFORE UPDATE ON public.lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Agregar columnas faltantes a leads si no existen
DO $$ 
BEGIN 
  -- Verificar y agregar won_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'won_date'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN won_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Verificar y agregar lost_date  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lost_date'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN lost_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Verificar y agregar deal_value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'deal_value'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN deal_value NUMERIC;
  END IF;
  
  -- Verificar y agregar lost_reason
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lost_reason'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN lost_reason TEXT;
  END IF;
END $$;