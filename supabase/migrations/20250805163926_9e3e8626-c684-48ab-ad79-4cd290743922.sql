-- Fix all lead stage change triggers - use CASCADE to handle dependencies
DROP FUNCTION IF EXISTS handle_lead_stage_change() CASCADE;

-- Recreate the function with correct schema
CREATE OR REPLACE FUNCTION handle_lead_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create activity if stage actually changed
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    INSERT INTO lead_activities (
      lead_id,
      activity_type,
      activity_data,
      points_awarded,
      created_by
    ) VALUES (
      NEW.id,
      'STAGE_CHANGED',
      jsonb_build_object(
        'old_stage', OLD.pipeline_stage,
        'new_stage', NEW.pipeline_stage,
        'timestamp', now(),
        'title', 'Cambio de etapa del pipeline',
        'description', 'La etapa cambió de ' || COALESCE(OLD.pipeline_stage, 'Sin etapa') || ' a ' || COALESCE(NEW.pipeline_stage, 'Sin etapa')
      ),
      5,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate all the triggers that were dependent on this function
CREATE TRIGGER handle_lead_stage_change
  BEFORE UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_stage_change();

CREATE TRIGGER trigger_lead_stage_automation
  AFTER UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_stage_change();