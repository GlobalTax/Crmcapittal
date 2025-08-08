-- Paso 1: Añadir columna probability a pipeline_stages
ALTER TABLE public.pipeline_stages 
ADD COLUMN IF NOT EXISTS probability integer DEFAULT 50 CHECK (probability >= 0 AND probability <= 100);

-- Paso 2: Crear tabla de automatizaciones por etapa
CREATE TABLE IF NOT EXISTS public.pipeline_stage_automations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id uuid NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'create_task', 'send_email', 'update_field', etc.
  action_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_automations_stage_id ON public.pipeline_stage_automations(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_automations_active ON public.pipeline_stage_automations(is_active) WHERE is_active = true;

-- RLS para pipeline_stage_automations
ALTER TABLE public.pipeline_stage_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden gestionar automatizaciones de pipeline" ON public.pipeline_stage_automations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Usuarios pueden ver automatizaciones de pipeline" ON public.pipeline_stage_automations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ) OR is_active = true
  );

-- Función para actualizar probability del lead cuando cambia de etapa
CREATE OR REPLACE FUNCTION public.update_lead_probability_on_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si cambió la etapa
  IF OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id THEN
    -- Obtener la probabilidad de la nueva etapa
    UPDATE public.leads 
    SET 
      probability = COALESCE(
        (SELECT probability FROM public.pipeline_stages WHERE id = NEW.pipeline_stage_id),
        NEW.probability -- mantener valor actual si no hay etapa
      ),
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar probability automáticamente
DROP TRIGGER IF EXISTS trigger_update_lead_probability ON public.leads;
CREATE TRIGGER trigger_update_lead_probability
  AFTER UPDATE OF pipeline_stage_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_probability_on_stage_change();

-- Función para ejecutar automatizaciones cuando cambia de etapa
CREATE OR REPLACE FUNCTION public.execute_stage_automations()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
  task_title text;
  task_due_date timestamp with time zone;
  assigned_user_id uuid;
BEGIN
  -- Solo ejecutar si cambió la etapa
  IF OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id THEN
    
    -- Buscar automatizaciones activas para la nueva etapa
    FOR automation_record IN 
      SELECT * FROM public.pipeline_stage_automations 
      WHERE stage_id = NEW.pipeline_stage_id 
      AND is_active = true
    LOOP
      
      -- Ejecutar según el tipo de acción
      CASE automation_record.action_type
        WHEN 'create_task' THEN
          -- Extraer datos de la configuración
          task_title := automation_record.action_data->>'title';
          task_due_date := now() + (COALESCE(automation_record.action_data->>'due_in_days', '2')::integer || ' days')::interval;
          assigned_user_id := COALESCE(
            (automation_record.action_data->>'assigned_to_id')::uuid,
            NEW.assigned_to_id
          );
          
          -- Crear la tarea
          INSERT INTO public.lead_tasks (
            lead_id,
            title,
            description,
            due_date,
            priority,
            assigned_to,
            created_by,
            status
          ) VALUES (
            NEW.id,
            COALESCE(task_title, 'Tarea automática'),
            COALESCE(automation_record.action_data->>'description', 'Tarea creada automáticamente al cambiar de etapa'),
            task_due_date,
            COALESCE(automation_record.action_data->>'priority', 'medium'),
            assigned_user_id,
            COALESCE(NEW.assigned_to_id, auth.uid()),
            'pending'
          );
          
        -- Aquí se pueden añadir más tipos de automatización en el futuro
        -- WHEN 'send_email' THEN ...
        -- WHEN 'update_field' THEN ...
      END CASE;
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar automatizaciones
DROP TRIGGER IF EXISTS trigger_execute_stage_automations ON public.leads;
CREATE TRIGGER trigger_execute_stage_automations
  AFTER UPDATE OF pipeline_stage_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.execute_stage_automations();

-- Backfill: actualizar probabilidades por defecto según nombres de etapa (solo si probability es NULL o valor por defecto)
UPDATE public.pipeline_stages 
SET probability = CASE 
  WHEN LOWER(name) LIKE '%new%' OR LOWER(name) LIKE '%nuevo%' OR LOWER(name) LIKE '%pipeline%' THEN 5
  WHEN LOWER(name) LIKE '%qualified%' OR LOWER(name) LIKE '%cualificado%' THEN 25
  WHEN LOWER(name) LIKE '%nda%' OR LOWER(name) LIKE '%info%' OR LOWER(name) LIKE '%propuesta%' THEN 50
  WHEN LOWER(name) LIKE '%negotiation%' OR LOWER(name) LIKE '%negociaci%' THEN 75
  WHEN LOWER(name) LIKE '%signed%' OR LOWER(name) LIKE '%mandate%' OR LOWER(name) LIKE '%ganado%' OR LOWER(name) LIKE '%won%' THEN 100
  WHEN LOWER(name) LIKE '%lost%' OR LOWER(name) LIKE '%perdido%' OR LOWER(name) LIKE '%closed%' THEN 0
  ELSE probability -- mantener valor actual si no coincide
END
WHERE probability IS NULL OR probability = 50; -- solo actualizar valores por defecto

-- Semillas de automatizaciones base
INSERT INTO public.pipeline_stage_automations (stage_id, action_type, action_data, is_active, created_by)
SELECT 
  ps.id,
  'create_task',
  jsonb_build_object(
    'title', CASE 
      WHEN LOWER(ps.name) LIKE '%qualified%' OR LOWER(ps.name) LIKE '%cualificado%' THEN 'Llamar al lead'
      WHEN LOWER(ps.name) LIKE '%nda%' OR LOWER(ps.name) LIKE '%info%' OR LOWER(ps.name) LIKE '%propuesta%' THEN 'Preparar propuesta'
      WHEN LOWER(ps.name) LIKE '%negotiation%' OR LOWER(ps.name) LIKE '%negociaci%' THEN 'Actualizar forecast'
    END,
    'description', CASE 
      WHEN LOWER(ps.name) LIKE '%qualified%' OR LOWER(ps.name) LIKE '%cualificado%' THEN 'Realizar llamada de seguimiento al lead cualificado'
      WHEN LOWER(ps.name) LIKE '%nda%' OR LOWER(ps.name) LIKE '%info%' OR LOWER(ps.name) LIKE '%propuesta%' THEN 'Preparar y enviar propuesta comercial'
      WHEN LOWER(ps.name) LIKE '%negotiation%' OR LOWER(ps.name) LIKE '%negociaci%' THEN 'Actualizar previsiones y estado de negociación'
    END,
    'priority', CASE 
      WHEN LOWER(ps.name) LIKE '%qualified%' OR LOWER(ps.name) LIKE '%cualificado%' THEN 'medium'
      WHEN LOWER(ps.name) LIKE '%nda%' OR LOWER(ps.name) LIKE '%info%' OR LOWER(ps.name) LIKE '%propuesta%' THEN 'high'
      WHEN LOWER(ps.name) LIKE '%negotiation%' OR LOWER(ps.name) LIKE '%negociaci%' THEN 'medium'
    END,
    'due_in_days', CASE 
      WHEN LOWER(ps.name) LIKE '%qualified%' OR LOWER(ps.name) LIKE '%cualificado%' THEN 2
      WHEN LOWER(ps.name) LIKE '%nda%' OR LOWER(ps.name) LIKE '%info%' OR LOWER(ps.name) LIKE '%propuesta%' THEN 3
      WHEN LOWER(ps.name) LIKE '%negotiation%' OR LOWER(ps.name) LIKE '%negociaci%' THEN 5
    END
  ),
  true,
  (SELECT id FROM auth.users LIMIT 1) -- usar el primer usuario disponible
FROM public.pipeline_stages ps
WHERE ps.is_active = true
AND (
  LOWER(ps.name) LIKE '%qualified%' OR LOWER(ps.name) LIKE '%cualificado%' OR
  LOWER(ps.name) LIKE '%nda%' OR LOWER(ps.name) LIKE '%info%' OR LOWER(ps.name) LIKE '%propuesta%' OR
  LOWER(ps.name) LIKE '%negotiation%' OR LOWER(ps.name) LIKE '%negociaci%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.pipeline_stage_automations psa 
  WHERE psa.stage_id = ps.id AND psa.action_type = 'create_task'
);

-- Backfill: sincronizar probability de leads existentes con su etapa actual
UPDATE public.leads 
SET probability = COALESCE(
  (SELECT probability FROM public.pipeline_stages WHERE id = leads.pipeline_stage_id),
  leads.probability
)
WHERE pipeline_stage_id IS NOT NULL;