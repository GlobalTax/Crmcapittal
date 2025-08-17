-- Fix foreign key constraint violation on leads.pipeline_stage_id
-- Update leads with invalid pipeline_stage_id to use the first stage of active LEAD pipeline

-- First, get the first stage of the active LEAD pipeline and update orphaned leads
UPDATE public.leads 
SET pipeline_stage_id = (
  SELECT s.id 
  FROM public.stages s
  JOIN public.pipelines p ON s.pipeline_id = p.id
  WHERE p.type = 'LEAD' 
    AND p.is_active = true 
    AND s.is_active = true
  ORDER BY s.order_index ASC
  LIMIT 1
)
WHERE pipeline_stage_id IS NOT NULL 
  AND pipeline_stage_id NOT IN (
    SELECT id FROM public.stages WHERE is_active = true
  );

-- Update leads with NULL pipeline_stage_id to use the first stage
UPDATE public.leads 
SET pipeline_stage_id = (
  SELECT s.id 
  FROM public.stages s
  JOIN public.pipelines p ON s.pipeline_id = p.id
  WHERE p.type = 'LEAD' 
    AND p.is_active = true 
    AND s.is_active = true
  ORDER BY s.order_index ASC
  LIMIT 1
)
WHERE pipeline_stage_id IS NULL;

-- Add a function to validate pipeline_stage_id before insert/update
CREATE OR REPLACE FUNCTION validate_lead_pipeline_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- If pipeline_stage_id is provided, ensure it exists and is active
  IF NEW.pipeline_stage_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.stages 
      WHERE id = NEW.pipeline_stage_id AND is_active = true
    ) THEN
      -- Set to first stage of active LEAD pipeline if invalid
      SELECT s.id INTO NEW.pipeline_stage_id
      FROM public.stages s
      JOIN public.pipelines p ON s.pipeline_id = p.id
      WHERE p.type = 'LEAD' 
        AND p.is_active = true 
        AND s.is_active = true
      ORDER BY s.order_index ASC
      LIMIT 1;
    END IF;
  ELSE
    -- If NULL, set to first stage of active LEAD pipeline
    SELECT s.id INTO NEW.pipeline_stage_id
    FROM public.stages s
    JOIN public.pipelines p ON s.pipeline_id = p.id
    WHERE p.type = 'LEAD' 
      AND p.is_active = true 
      AND s.is_active = true
    ORDER BY s.order_index ASC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate pipeline_stage_id
DROP TRIGGER IF EXISTS validate_lead_pipeline_stage_trigger ON public.leads;
CREATE TRIGGER validate_lead_pipeline_stage_trigger
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION validate_lead_pipeline_stage();