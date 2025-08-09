-- Harden functions created in previous migration by setting search_path
CREATE OR REPLACE FUNCTION public.calculate_opportunity_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.log_opportunity_score_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_old INTEGER := COALESCE(OLD.opportunity_score, NULL);
  v_new INTEGER := COALESCE(NEW.opportunity_score, NULL);
BEGIN
  IF TG_OP = 'INSERT' THEN
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
$$;