-- 1) Ensure columns and seed pipeline_stages
-- Add probability and slug to pipeline_stages, and indexes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pipeline_stages' AND column_name = 'probability'
  ) THEN
    ALTER TABLE public.pipeline_stages
    ADD COLUMN probability integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pipeline_stages' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.pipeline_stages
    ADD COLUMN slug text;
  END IF;
END $$;

-- Unique index on slug when set
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'pipeline_stages' AND indexname = 'uniq_pipeline_stages_slug'
  ) THEN
    CREATE UNIQUE INDEX uniq_pipeline_stages_slug ON public.pipeline_stages (slug) WHERE slug IS NOT NULL;
  END IF;
END $$;

-- Helpful index for ordering
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'pipeline_stages' AND indexname = 'idx_pipeline_stages_stage_order'
  ) THEN
    CREATE INDEX idx_pipeline_stages_stage_order ON public.pipeline_stages (stage_order);
  END IF;
END $$;

-- Upsert the official stages with probabilities and colors
-- Using ON CONFLICT on slug
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
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  stage_order = EXCLUDED.stage_order,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  probability = EXCLUDED.probability;

-- Update timestamps trigger if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pipeline_stages_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_pipeline_stages_updated_at
    BEFORE UPDATE ON public.pipeline_stages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;