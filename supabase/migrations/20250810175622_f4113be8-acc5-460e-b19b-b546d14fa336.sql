-- Add missing columns first
ALTER TABLE public.pipeline_stages
  ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.pipeline_stages
  ADD COLUMN IF NOT EXISTS probability integer NOT NULL DEFAULT 0;

-- Create unique index on slug (partial)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pipeline_stages_slug 
  ON public.pipeline_stages (slug) WHERE slug IS NOT NULL;

-- Create order index
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_stage_order 
  ON public.pipeline_stages (stage_order);

-- Update if exists, otherwise insert (per-stage)
-- new_lead
UPDATE public.pipeline_stages 
SET name='New Lead', stage_order=1, color='#3b82f6', is_active=true, probability=5
WHERE slug='new_lead';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'New Lead', 1, '#3b82f6', true, 5, 'new_lead'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='new_lead');

-- qualified
UPDATE public.pipeline_stages 
SET name='Qualified', stage_order=2, color='#10b981', is_active=true, probability=15
WHERE slug='qualified';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'Qualified', 2, '#10b981', true, 15, 'qualified'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='qualified');

-- nda_sent
UPDATE public.pipeline_stages 
SET name='NDA Sent', stage_order=3, color='#f59e0b', is_active=true, probability=25
WHERE slug='nda_sent';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'NDA Sent', 3, '#f59e0b', true, 25, 'nda_sent'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='nda_sent');

-- nda_signed
UPDATE public.pipeline_stages 
SET name='NDA Signed', stage_order=4, color='#34d399', is_active=true, probability=30
WHERE slug='nda_signed';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'NDA Signed', 4, '#34d399', true, 30, 'nda_signed'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='nda_signed');

-- info_shared
UPDATE public.pipeline_stages 
SET name='Info Shared', stage_order=5, color='#06b6d4', is_active=true, probability=40
WHERE slug='info_shared';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'Info Shared', 5, '#06b6d4', true, 40, 'info_shared'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='info_shared');

-- negotiation
UPDATE public.pipeline_stages 
SET name='Negotiation', stage_order=6, color='#8b5cf6', is_active=true, probability=70
WHERE slug='negotiation';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'Negotiation', 6, '#8b5cf6', true, 70, 'negotiation'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='negotiation');

-- mandate_signed
UPDATE public.pipeline_stages 
SET name='Mandate Signed', stage_order=7, color='#10b981', is_active=true, probability=100
WHERE slug='mandate_signed';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'Mandate Signed', 7, '#10b981', true, 100, 'mandate_signed'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='mandate_signed');

-- closed_lost
UPDATE public.pipeline_stages 
SET name='Closed Lost', stage_order=8, color='#ef4444', is_active=true, probability=0
WHERE slug='closed_lost';
INSERT INTO public.pipeline_stages (id, name, stage_order, color, is_active, probability, slug)
SELECT gen_random_uuid(), 'Closed Lost', 8, '#ef4444', true, 0, 'closed_lost'
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE slug='closed_lost');