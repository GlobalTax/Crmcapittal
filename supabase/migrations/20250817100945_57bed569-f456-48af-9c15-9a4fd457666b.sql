-- Fix the execute_stage_automations function and then update leads
-- First, fix the problematic function that references non-existent priority column

CREATE OR REPLACE FUNCTION execute_stage_automations()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
BEGIN
  -- Execute automations for the new stage
  FOR automation_record IN 
    SELECT * FROM public.pipeline_stage_automations 
    WHERE stage_id = NEW.pipeline_stage_id 
      AND is_active = true
    ORDER BY created_at ASC  -- Remove priority reference since column doesn't exist
  LOOP
    -- Log the automation execution
    INSERT INTO public.automation_logs (
      automation_type,
      entity_type, 
      entity_id,
      trigger_event,
      action_taken,
      action_data,
      status,
      user_id
    ) VALUES (
      'stage_automation',
      'lead',
      NEW.id,
      'stage_change',
      automation_record.action_type,
      automation_record.action_data,
      'executed',
      auth.uid()
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now update leads with NULL pipeline_stage_id to use "New Lead" stage
UPDATE public.leads 
SET pipeline_stage_id = 'dad77441-1018-4019-8779-bee5f08aff28' -- "New Lead" stage  
WHERE pipeline_stage_id IS NULL;