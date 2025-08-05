-- Fix all lead stage change triggers with correct column names
DROP FUNCTION IF EXISTS handle_lead_stage_change() CASCADE;

-- Recreate the function with correct schema using pipeline_stage_id
CREATE OR REPLACE FUNCTION handle_lead_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create activity if stage actually changed
  IF OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id THEN
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
        'old_stage_id', OLD.pipeline_stage_id,
        'new_stage_id', NEW.pipeline_stage_id,
        'timestamp', now(),
        'title', 'Cambio de etapa del pipeline',
        'description', 'La etapa del pipeline ha sido actualizada'
      ),
      5,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with correct column name
CREATE TRIGGER handle_lead_stage_change
  BEFORE UPDATE OF pipeline_stage_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_stage_change();