-- Create trigger to run stage automations when a lead changes stage
BEGIN;

-- Safety: remove existing trigger if present
DROP TRIGGER IF EXISTS trg_execute_stage_automations ON public.leads;

-- Attach trigger to leads table to invoke automation function on stage change
CREATE TRIGGER trg_execute_stage_automations
AFTER UPDATE OF pipeline_stage_id ON public.leads
FOR EACH ROW
WHEN (OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id)
EXECUTE FUNCTION public.execute_stage_automations();

COMMIT;