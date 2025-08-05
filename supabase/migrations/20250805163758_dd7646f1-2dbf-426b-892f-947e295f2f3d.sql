-- Fix the handle_lead_stage_change trigger to use correct schema
-- The trigger was trying to insert into non-existent columns 'title' and 'description'

DROP TRIGGER IF EXISTS handle_lead_stage_change ON leads;
DROP FUNCTION IF EXISTS handle_lead_stage_change();

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

-- Recreate the trigger
CREATE TRIGGER handle_lead_stage_change
  BEFORE UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_stage_change();