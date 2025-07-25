-- Crear un pipeline específico para mandatos de compra
INSERT INTO public.pipelines (name, type, description, is_active)
VALUES (
  'Pipeline de Mandatos de Compra',
  'MANDATE',
  'Pipeline específico para gestionar el proceso de mandatos de compra y venta',
  true
) ON CONFLICT (type) WHERE is_active = true DO NOTHING;

-- Crear etapas específicas para el pipeline de mandatos si no existen
DO $$
DECLARE
  mandate_pipeline_id UUID;
BEGIN
  -- Obtener el ID del pipeline de mandatos
  SELECT id INTO mandate_pipeline_id
  FROM public.pipelines
  WHERE type = 'MANDATE' AND is_active = true
  LIMIT 1;
  
  -- Crear las etapas solo si el pipeline existe y no tiene etapas
  IF mandate_pipeline_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.stages WHERE pipeline_id = mandate_pipeline_id
  ) THEN
    
    INSERT INTO public.stages (name, description, order_index, color, pipeline_id, is_active) VALUES
    ('Nuevo Mandato', 'Mandato recién creado y en evaluación inicial', 1, '#3B82F6', mandate_pipeline_id, true),
    ('En Evaluación', 'Analizando criterios y viabilidad del mandato', 2, '#F59E0B', mandate_pipeline_id, true),
    ('Activo', 'Mandato activo con búsqueda en progreso', 3, '#10B981', mandate_pipeline_id, true),
    ('Targets Identificados', 'Se han identificado empresas objetivo', 4, '#8B5CF6', mandate_pipeline_id, true),
    ('En Negociación', 'Negociaciones activas con targets interesados', 5, '#EF4444', mandate_pipeline_id, true),
    ('Completado', 'Mandato exitosamente completado', 6, '#059669', mandate_pipeline_id, true),
    ('Pausado', 'Mandato temporalmente pausado', 7, '#6B7280', mandate_pipeline_id, true),
    ('Cancelado', 'Mandato cancelado por el cliente', 8, '#374151', mandate_pipeline_id, true);
    
  END IF;
END $$;