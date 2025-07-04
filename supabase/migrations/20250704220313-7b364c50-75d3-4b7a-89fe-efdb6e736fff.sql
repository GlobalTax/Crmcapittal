-- First, let's see what stages exist and are being used
-- Create clean stages if they don't exist
DO $$ 
DECLARE 
  default_pipeline_id UUID;
  nuevo_stage_id UUID;
BEGIN
  -- Get or create default pipeline
  SELECT id INTO default_pipeline_id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1;
  IF default_pipeline_id IS NULL THEN
    INSERT INTO pipelines (name, description, is_active) VALUES ('Default Pipeline', 'Main business pipeline', true) RETURNING id INTO default_pipeline_id;
  END IF;

  -- Create clean stages
  INSERT INTO stages (name, order_index, color, description, pipeline_id) VALUES
  ('Nuevo', 1, '#6B7280', 'Negocios nuevos', default_pipeline_id),
  ('En Proceso', 2, '#3B82F6', 'Negocios en desarrollo', default_pipeline_id),
  ('Propuesta', 3, '#F59E0B', 'Propuesta enviada', default_pipeline_id),
  ('Ganado', 4, '#10B981', 'Negocio cerrado exitosamente', default_pipeline_id),
  ('Perdido', 5, '#EF4444', 'Negocio perdido', default_pipeline_id)
  ON CONFLICT (name, pipeline_id) DO NOTHING;

  -- Get the new 'Nuevo' stage ID
  SELECT id INTO nuevo_stage_id FROM stages WHERE name = 'Nuevo' AND pipeline_id = default_pipeline_id;

  -- Update all deals to use the new 'Nuevo' stage
  UPDATE deals SET stage_id = nuevo_stage_id WHERE stage_id IS NULL OR stage_id NOT IN (
    SELECT id FROM stages WHERE pipeline_id = default_pipeline_id
  );
END $$;