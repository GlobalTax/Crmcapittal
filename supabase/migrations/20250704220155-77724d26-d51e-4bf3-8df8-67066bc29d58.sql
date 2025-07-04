-- Clean up stages to keep only essential ones
DELETE FROM stages WHERE pipeline_id NOT IN (
  SELECT id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
);

-- Create simple, clean stages for the main pipeline
INSERT INTO stages (name, order_index, color, description, pipeline_id) 
SELECT 'Nuevo', 1, '#6B7280', 'Negocios nuevos', id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stages (name, order_index, color, description, pipeline_id) 
SELECT 'En Proceso', 2, '#3B82F6', 'Negocios en desarrollo', id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stages (name, order_index, color, description, pipeline_id) 
SELECT 'Propuesta', 3, '#F59E0B', 'Propuesta enviada', id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stages (name, order_index, color, description, pipeline_id) 
SELECT 'Ganado', 4, '#10B981', 'Negocio cerrado exitosamente', id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stages (name, order_index, color, description, pipeline_id) 
SELECT 'Perdido', 5, '#EF4444', 'Negocio perdido', id FROM pipelines WHERE name = 'Default Pipeline' LIMIT 1
ON CONFLICT DO NOTHING;