-- Retry upsert using ON CONFLICT ON CONSTRAINT to match partial unique index
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
VALUES
  (gen_random_uuid(), 'New Lead', 1, '#3b82f6', true, 5, 'new_lead'),
  (gen_random_uuid(), 'Qualified', 2, '#10b981', true, 15, 'qualified'),
  (gen_random_uuid(), 'NDA Sent', 3, '#f59e0b', true, 25, 'nda_sent'),
  (gen_random_uuid(), 'NDA Signed', 4, '#34d399', true, 30, 'nda_signed'),
  (gen_random_uuid(), 'Info Shared', 5, '#06b6d4', true, 40, 'info_shared'),
  (gen_random_uuid(), 'Negotiation', 6, '#8b5cf6', true, 70, 'negotiation'),
  (gen_random_uuid(), 'Mandate Signed', 7, '#10b981', true, 100, 'mandate_signed'),
  (gen_random_uuid(), 'Closed Lost', 8, '#ef4444', true, 0, 'closed_lost')
ON CONFLICT ON CONSTRAINT uniq_pipeline_stages_slug DO UPDATE SET
  name = EXCLUDED.name,
  stage_order = EXCLUDED.stage_order,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  probability = EXCLUDED.probability;