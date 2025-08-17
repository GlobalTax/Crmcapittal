-- Simple fix: ensure all leads have valid pipeline_stage_id
-- The problematic IDs actually exist, so we just need to ensure data consistency

-- Update any leads with NULL pipeline_stage_id to use "New Lead" stage
UPDATE public.leads 
SET pipeline_stage_id = 'dad77441-1018-4019-8779-bee5f08aff28' -- "New Lead" stage
WHERE pipeline_stage_id IS NULL;

-- Verify that all leads now have valid pipeline_stage_id values
-- This will show us if there are any other orphaned records
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM public.leads l
  WHERE l.pipeline_stage_id IS NOT NULL 
    AND l.pipeline_stage_id NOT IN (
      SELECT id FROM public.pipeline_stages WHERE is_active = true
    );
  
  IF invalid_count > 0 THEN
    RAISE NOTICE 'Found % leads with invalid pipeline_stage_id that need manual cleanup', invalid_count;
  ELSE
    RAISE NOTICE 'All leads now have valid pipeline_stage_id references';
  END IF;
END
$$;