-- Add last_contacted field to leads table
ALTER TABLE public.leads 
ADD COLUMN last_contacted TIMESTAMP WITH TIME ZONE;

-- Update existing leads to set last_contacted based on latest interaction
UPDATE public.leads 
SET last_contacted = (
  SELECT MAX(interaction_date) 
  FROM contact_interactions ci 
  WHERE ci.lead_id = leads.id
);

-- If no interactions exist, use created_at as fallback
UPDATE public.leads 
SET last_contacted = created_at 
WHERE last_contacted IS NULL;

-- Create inactivity scoring rule
INSERT INTO public.lead_scoring_rules (
  nombre,
  description,
  condicion,
  valor,
  activo
) VALUES (
  'Penalización por Inactividad',
  'Descuenta puntos cuando un lead lleva más de 30 días sin contacto',
  jsonb_build_object(
    'activity_type', 'INACTIVITY_PENALTY',
    'criteria', jsonb_build_object(
      'days_inactive', 30,
      'target_stages', ARRAY['Pipeline', 'Cualificado', 'Propuesta']
    )
  ),
  -20,
  true
);

-- Create function to process inactive leads
CREATE OR REPLACE FUNCTION public.process_inactive_leads()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record RECORD;
  task_count INTEGER := 0;
  score_updates INTEGER := 0;
  result jsonb;
BEGIN
  -- Find inactive leads in target stages
  FOR lead_record IN 
    SELECT l.id, l.name, l.email, l.assigned_to_id, l.pipeline_stage_id, l.last_contacted
    FROM leads l
    JOIN pipeline_stages ps ON l.pipeline_stage_id = ps.id
    WHERE l.last_contacted < NOW() - INTERVAL '30 days'
    AND ps.name IN ('Pipeline', 'Cualificado', 'Propuesta')
    AND l.status NOT IN ('CONVERTED', 'DISQUALIFIED')
  LOOP
    -- Create reactivation task
    INSERT INTO lead_tasks (
      lead_id,
      title,
      description,
      priority,
      status,
      assigned_to,
      due_date,
      created_by
    ) VALUES (
      lead_record.id,
      'Reactivar lead',
      'Lead inactivo por más de 30 días. Requiere reactivación urgente.',
      'high',
      'pending',
      COALESCE(lead_record.assigned_to_id, (
        SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1
      )),
      NOW() + INTERVAL '3 days',
      (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1)
    );
    
    task_count := task_count + 1;
    
    -- Apply inactivity penalty using existing scoring system
    PERFORM public.update_lead_score(lead_record.id, -20);
    
    -- Log the score change
    PERFORM public.log_lead_score_change(
      lead_record.id,
      'Penalización por Inactividad',
      -20,
      COALESCE((SELECT lead_score FROM lead_nurturing WHERE lead_id = lead_record.id), 0) - 20
    );
    
    score_updates := score_updates + 1;
    
    -- Update last_activity_date in lead_nurturing
    INSERT INTO lead_nurturing (lead_id, stage, last_activity_date, updated_at)
    VALUES (lead_record.id, 'NURTURING', NOW(), NOW())
    ON CONFLICT (lead_id) 
    DO UPDATE SET 
      last_activity_date = NOW(),
      updated_at = NOW();
    
  END LOOP;
  
  -- Log the operation
  RAISE NOTICE 'Processed % inactive leads, created % tasks, applied % score penalties', 
    score_updates, task_count, score_updates;
  
  result := jsonb_build_object(
    'processed_leads', score_updates,
    'created_tasks', task_count,
    'score_penalties', score_updates,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- Create trigger to update last_contacted when interactions are created
CREATE OR REPLACE FUNCTION public.update_lead_last_contacted()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL THEN
    UPDATE leads 
    SET last_contacted = NEW.interaction_date
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on contact_interactions
DROP TRIGGER IF EXISTS trigger_update_lead_last_contacted ON contact_interactions;
CREATE TRIGGER trigger_update_lead_last_contacted
  AFTER INSERT OR UPDATE ON contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_last_contacted();

-- Schedule weekly cron job for lead inactivity processing
SELECT cron.schedule(
  'process-inactive-leads-weekly',
  '0 9 * * 1', -- Every Monday at 9 AM
  $$
  SELECT public.process_inactive_leads();
  $$
);