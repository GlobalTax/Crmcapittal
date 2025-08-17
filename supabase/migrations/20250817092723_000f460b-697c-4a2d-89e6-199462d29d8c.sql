-- Create default LEAD pipeline if it doesn't exist
INSERT INTO public.pipelines (name, type, description, is_active)
SELECT 'Pipeline de Leads', 'LEAD', 'Pipeline por defecto para gestión de leads', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines WHERE type = 'LEAD' AND is_active = true
);

-- Create default stages for LEAD pipeline
WITH lead_pipeline AS (
  SELECT id FROM public.pipelines WHERE type = 'LEAD' AND is_active = true LIMIT 1
)
INSERT INTO public.stages (name, description, order_index, color, pipeline_id, is_active, probability)
SELECT * FROM (
  SELECT 'New Lead' as name, 'Lead inicial capturado' as description, 1 as order_index, '#22c55e' as color, lead_pipeline.id as pipeline_id, true as is_active, 5 as probability FROM lead_pipeline
  UNION ALL
  SELECT 'Qualified', 'Lead cualificado tras pre-screen', 2, '#3b82f6', lead_pipeline.id, true, 15 FROM lead_pipeline
  UNION ALL
  SELECT 'NDA Sent', 'NDA enviado vía DocuSign', 3, '#f59e0b', lead_pipeline.id, true, 25 FROM lead_pipeline
  UNION ALL
  SELECT 'NDA Signed', 'NDA firmado', 4, '#8b5cf6', lead_pipeline.id, true, 30 FROM lead_pipeline
  UNION ALL
  SELECT 'Info Shared', 'Teaser o Brief enviado', 5, '#06b6d4', lead_pipeline.id, true, 40 FROM lead_pipeline
  UNION ALL
  SELECT 'Negotiation', 'Negociando borrador de Mandato', 6, '#ef4444', lead_pipeline.id, true, 70 FROM lead_pipeline
  UNION ALL
  SELECT 'Mandate Signed', 'Mandato firmado', 7, '#10b981', lead_pipeline.id, true, 100 FROM lead_pipeline
) stages_to_insert
WHERE NOT EXISTS (
  SELECT 1 FROM public.stages s 
  WHERE s.pipeline_id = (SELECT id FROM lead_pipeline) 
  AND s.name = stages_to_insert.name
);