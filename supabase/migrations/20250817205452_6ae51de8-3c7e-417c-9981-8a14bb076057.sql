-- Desactivar todas las etapas existentes
UPDATE pipeline_stages SET is_active = false;

-- Activar y configurar pipeline mínimo (5 etapas)
-- 1. Nuevo Lead
UPDATE pipeline_stages 
SET 
  is_active = true,
  stage_order = 1,
  color = '#6366f1',
  probability = 5,
  stage_config = '{}'
WHERE name = 'New Lead';

-- 2. Cualificado (mantener checklist existente)
UPDATE pipeline_stages 
SET 
  is_active = true,
  stage_order = 2,
  color = '#3b82f6',
  probability = 25
WHERE name = 'Cualificado';

-- 3. Propuesta
UPDATE pipeline_stages 
SET 
  is_active = true,
  stage_order = 3,
  color = '#f59e0b',
  probability = 40,
  stage_config = '{}'
WHERE name = 'Propuesta';

-- 4. Negociación
UPDATE pipeline_stages 
SET 
  is_active = true,
  stage_order = 4,
  color = '#ef4444',
  probability = 70,
  stage_config = '{}'
WHERE name = 'Negociación';

-- 5. Ganado (etapa final)
UPDATE pipeline_stages 
SET 
  is_active = true,
  stage_order = 5,
  color = '#10b981',
  probability = 100,
  stage_config = '{}'
WHERE name = 'Ganado';

-- Crear etapa "Perdido" si no existe
INSERT INTO pipeline_stages (name, stage_order, color, probability, is_active, stage_config)
SELECT 'Perdido', 6, '#6b7280', 0, true, '{}'
WHERE NOT EXISTS (SELECT 1 FROM pipeline_stages WHERE name = 'Perdido' AND is_active = true);