-- 1) Columns for opportunity profiling and score
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS sector_attractiveness INTEGER,
ADD COLUMN IF NOT EXISTS investment_capacity INTEGER,
ADD COLUMN IF NOT EXISTS urgency INTEGER,
ADD COLUMN IF NOT EXISTS strategic_fit INTEGER,
ADD COLUMN IF NOT EXISTS opportunity_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2) Events table for telemetry
CREATE TABLE IF NOT EXISTS public.opportunity_score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NULL,
  old_score INTEGER,
  new_score INTEGER,
  factor_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage TEXT,
  probability NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_opportunity_score_events_opportunity_id
  ON public.opportunity_score_events(opportunity_id);

-- 3) Enable RLS and policies
ALTER TABLE public.opportunity_score_events ENABLE ROW LEVEL SECURITY;

-- Select policy based on opportunity access
DROP POLICY IF EXISTS "oppscore_select_accessible" ON public.opportunity_score_events;
CREATE POLICY "oppscore_select_accessible"
ON public.opportunity_score_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_id
      AND (
        o.created_by = auth.uid()
        OR o.assigned_to = auth.uid()
        OR has_role_secure(auth.uid(), 'admin'::app_role)
        OR has_role_secure(auth.uid(), 'superadmin'::app_role)
      )
  )
);

-- Insert policy restricted to accessible opportunities
DROP POLICY IF EXISTS "oppscore_insert_accessible" ON public.opportunity_score_events;
CREATE POLICY "oppscore_insert_accessible"
ON public.opportunity_score_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_id
      AND (
        o.created_by = auth.uid()
        OR o.assigned_to = auth.uid()
        OR has_role_secure(auth.uid(), 'admin'::app_role)
        OR has_role_secure(auth.uid(), 'superadmin'::app_role)
      )
  )
);

-- Prevent updates/deletes by users (immutable telemetry)
DROP POLICY IF EXISTS "oppscore_update_none" ON public.opportunity_score_events;
CREATE POLICY "oppscore_update_none" ON public.opportunity_score_events FOR UPDATE USING (false);
DROP POLICY IF EXISTS "oppscore_delete_none" ON public.opportunity_score_events;
CREATE POLICY "oppscore_delete_none" ON public.opportunity_score_events FOR DELETE USING (false);

-- 4) Trigger: calculate score from factors (25/25/20/30)
CREATE OR REPLACE FUNCTION public.calculate_opportunity_score()
RETURNS trigger AS $$
DECLARE
  v_sa INTEGER := GREATEST(0, LEAST(100, COALESCE(NEW.sector_attractiveness, 0)));
  v_ic INTEGER := GREATEST(0, LEAST(100, COALESCE(NEW.investment_capacity, 0)));
  v_ug INTEGER := GREATEST(0, LEAST(100, COALESCE(NEW.urgency, 0)));
  v_sf INTEGER := GREATEST(0, LEAST(100, COALESCE(NEW.strategic_fit, 0)));
  v_score INTEGER;
BEGIN
  v_score := ROUND((v_sa * 0.25) + (v_ic * 0.25) + (v_ug * 0.20) + (v_sf * 0.30));
  NEW.sector_attractiveness := v_sa;
  NEW.investment_capacity := v_ic;
  NEW.urgency := v_ug;
  NEW.strategic_fit := v_sf;
  NEW.opportunity_score := GREATEST(0, LEAST(100, v_score));
  NEW.score_updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep score in sync
DROP TRIGGER IF EXISTS trg_calculate_opportunity_score ON public.opportunities;
CREATE TRIGGER trg_calculate_opportunity_score
BEFORE INSERT OR UPDATE OF sector_attractiveness, investment_capacity, urgency, strategic_fit
ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.calculate_opportunity_score();

-- 5) Trigger: log score changes
CREATE OR REPLACE FUNCTION public.log_opportunity_score_change()
RETURNS trigger AS $$
DECLARE
  v_old INTEGER := COALESCE(OLD.opportunity_score, NULL);
  v_new INTEGER := COALESCE(NEW.opportunity_score, NULL);
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log initial score when inserting if any factor is provided
    IF COALESCE(NEW.sector_attractiveness, NEW.investment_capacity, NEW.urgency, NEW.strategic_fit) IS NOT NULL THEN
      INSERT INTO public.opportunity_score_events (
        opportunity_id, user_id, old_score, new_score, factor_snapshot, stage, probability, metadata
      ) VALUES (
        NEW.id,
        auth.uid(),
        NULL,
        NEW.opportunity_score,
        jsonb_build_object(
          'sector_attractiveness', NEW.sector_attractiveness,
          'investment_capacity', NEW.investment_capacity,
          'urgency', NEW.urgency,
          'strategic_fit', NEW.strategic_fit
        ),
        NEW.stage,
        (NEW.probability)::numeric,
        '{}'
      );
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF v_old IS DISTINCT FROM v_new THEN
      INSERT INTO public.opportunity_score_events (
        opportunity_id, user_id, old_score, new_score, factor_snapshot, stage, probability, metadata
      ) VALUES (
        NEW.id,
        auth.uid(),
        v_old,
        v_new,
        jsonb_build_object(
          'sector_attractiveness', NEW.sector_attractiveness,
          'investment_capacity', NEW.investment_capacity,
          'urgency', NEW.urgency,
          'strategic_fit', NEW.strategic_fit
        ),
        NEW.stage,
        (NEW.probability)::numeric,
        '{}'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_opportunity_score_change ON public.opportunities;
CREATE TRIGGER trg_log_opportunity_score_change
AFTER INSERT OR UPDATE OF opportunity_score, sector_attractiveness, investment_capacity, urgency, strategic_fit
ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.log_opportunity_score_change();