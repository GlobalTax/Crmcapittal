-- Create DEAL pipeline with Attio-style stages
-- First, create the pipeline
INSERT INTO public.pipelines (name, type, description, is_active)
VALUES ('Deals Pipeline', 'DEAL', 'Main deals pipeline with Lead → In Progress → Won → Lost stages', true)
ON CONFLICT DO NOTHING;

-- Get the pipeline ID
DO $$
DECLARE
    pipeline_id UUID;
BEGIN
    SELECT id INTO pipeline_id FROM public.pipelines WHERE type = 'DEAL' AND name = 'Deals Pipeline';
    
    -- Delete existing DEAL stages to ensure clean setup
    DELETE FROM public.stages WHERE pipeline_id = pipeline_id;
    
    -- Insert the 4 specific stages according to Attio spec
    INSERT INTO public.stages (name, pipeline_id, order_index, color, description, is_active) VALUES
    ('Lead', pipeline_id, 1, '#1E88E5', 'New potential deals', true),
    ('In Progress', pipeline_id, 2, '#FFB300', 'Deals being actively worked', true),
    ('Won', pipeline_id, 3, '#00C48C', 'Successfully closed deals', true),
    ('Lost', pipeline_id, 4, '#EF5350', 'Deals that did not close', true);
END $$;