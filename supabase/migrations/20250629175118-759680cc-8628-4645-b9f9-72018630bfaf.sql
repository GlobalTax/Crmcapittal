
-- Crear un pipeline por defecto para DEAL si no existe
INSERT INTO public.pipelines (id, name, type, description, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pipeline de Deals por Defecto',
  'DEAL',
  'Pipeline por defecto para deals cuando no se especifica otro',
  true
) ON CONFLICT (id) DO NOTHING;

-- Crear stages por defecto para este pipeline si no existen
INSERT INTO public.stages (id, name, description, order_index, color, pipeline_id, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'Nuevo Lead', 'Leads nuevos sin procesar', 1, '#6B7280', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000102', 'En Contacto', 'Leads con los que se ha establecido contacto', 2, '#3B82F6', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000103', 'Calificado', 'Leads calificados como oportunidades', 3, '#10B981', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000104', 'Propuesta', 'Propuesta enviada al cliente', 4, '#F59E0B', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000105', 'Cerrado', 'Deal cerrado exitosamente', 5, '#059669', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;
