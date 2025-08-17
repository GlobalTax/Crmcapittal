-- Desactivar todas las etapas existentes para el pipeline LEAD
UPDATE pipeline_stages 
SET is_active = false 
WHERE pipeline_id = (
  SELECT id FROM pipelines WHERE type = 'LEAD' LIMIT 1
);

-- Crear/actualizar etapas del pipeline mínimo
WITH lead_pipeline AS (
  SELECT id FROM pipelines WHERE type = 'LEAD' LIMIT 1
)
INSERT INTO pipeline_stages (
  pipeline_id, 
  name, 
  description, 
  order_index, 
  color, 
  is_active,
  stage_config,
  probability
) VALUES
-- Etapa 1: Nuevo Lead
(
  (SELECT id FROM lead_pipeline),
  'Nuevo Lead',
  'Lead recién ingresado al sistema',
  1,
  '#6366f1',
  true,
  '{}',
  5
),
-- Etapa 2: Cualificado (mantener checklist existente)
(
  (SELECT id FROM lead_pipeline),
  'Cualificado',
  'Lead cualificado con información básica validada',
  2,
  '#3b82f6',
  true,
  '{
    "checklist": [
      {
        "key": "budget_confirmed",
        "label": "Presupuesto confirmado",
        "required": true
      },
      {
        "key": "decision_maker_identified",
        "label": "Tomador de decisiones identificado",
        "required": true
      },
      {
        "key": "timeline_established",
        "label": "Timeline establecido",
        "required": false
      },
      {
        "key": "need_validated",
        "label": "Necesidad validada",
        "required": true
      }
    ]
  }',
  25
),
-- Etapa 3: Propuesta
(
  (SELECT id FROM lead_pipeline),
  'Propuesta',
  'Propuesta presentada al cliente',
  3,
  '#f59e0b',
  true,
  '{}',
  40
),
-- Etapa 4: Negociación
(
  (SELECT id FROM lead_pipeline),
  'Negociación',
  'En proceso de negociación de términos',
  4,
  '#ef4444',
  true,
  '{}',
  70
),
-- Etapa 5: Cerrado
(
  (SELECT id FROM lead_pipeline),
  'Cerrado',
  'Deal ganado o perdido',
  5,
  '#10b981',
  true,
  '{}',
  100
)
ON CONFLICT (pipeline_id, name) DO UPDATE SET
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  stage_config = EXCLUDED.stage_config,
  probability = EXCLUDED.probability;