-- Vistas KPI y Funnel RLS-friendly para leads
-- Respetan RLS (simplemente seleccionan desde public.leads visible al usuario)
-- Sin SECURITY DEFINER (aplica a funciones, no a vistas)

-- 1) KPI: totales, calientes, qualified/converted, nuevas 7/30d y tasas protegidas
DROP VIEW IF EXISTS public.vw_leads_kpi CASCADE;
CREATE VIEW public.vw_leads_kpi AS
WITH base AS (
  SELECT id, created_at, status, prob_conversion
  FROM public.leads
), agg AS (
  SELECT 
    COUNT(*)                             AS total_leads,
    COUNT(*) FILTER (WHERE COALESCE(prob_conversion,0) >= 80) AS hot_leads,
    COUNT(*) FILTER (WHERE UPPER(COALESCE(status::text,'')) = 'QUALIFIED') AS qualified_leads,
    COUNT(*) FILTER (WHERE UPPER(COALESCE(status::text,'')) = 'CONVERTED') AS converted_leads,
    COUNT(*) FILTER (WHERE created_at >= (now() - INTERVAL '7 days'))  AS new_7d,
    COUNT(*) FILTER (WHERE created_at >= (now() - INTERVAL '30 days')) AS new_30d
  FROM base
)
SELECT 
  total_leads,
  hot_leads,
  qualified_leads,
  converted_leads,
  new_7d,
  new_30d,
  ROUND((qualified_leads::numeric / NULLIF(total_leads,0)) * 100, 2) AS qualified_rate,
  ROUND((converted_leads::numeric / NULLIF(total_leads,0)) * 100, 2) AS converted_rate,
  ROUND((hot_leads::numeric       / NULLIF(total_leads,0)) * 100, 2) AS hot_rate
FROM agg;

COMMENT ON VIEW public.vw_leads_kpi IS 'KPIs de leads basados en las filas visibles por RLS: totales, calientes (prob>=80), qualified/converted, nuevas 7/30d y tasas con protección ante división por 0.';

-- 2) Funnel: distribución por etapas (stage o pipeline_stage_id) y % sobre total visible
DROP VIEW IF EXISTS public.vw_leads_funnel CASCADE;
CREATE VIEW public.vw_leads_funnel AS
WITH base AS (
  SELECT 
    id,
    -- Etiqueta de etapa: usa stage si existe; si no, deriva de pipeline_stage_id; si ninguno, UNKNOWN
    COALESCE(
      NULLIF(UPPER(COALESCE(stage::text, '')), ''),
      CASE WHEN pipeline_stage_id IS NOT NULL THEN 'PIPE_' || (pipeline_stage_id::text) ELSE 'UNKNOWN' END
    ) AS stage_label
  FROM public.leads
), totals AS (
  SELECT COUNT(*) AS total FROM base
)
SELECT 
  b.stage_label,
  COUNT(*) AS stage_count,
  ROUND((COUNT(*)::numeric / NULLIF(t.total,0)) * 100, 2) AS stage_percent
FROM base b
CROSS JOIN totals t
GROUP BY b.stage_label, t.total
ORDER BY stage_count DESC;

COMMENT ON VIEW public.vw_leads_funnel IS 'Distribución de leads por etapa (usa stage si está disponible, si no deriva de pipeline_stage_id) con porcentaje sobre el total visible por RLS.';

-- ===============================
-- PRUEBAS (comentadas)
-- ===============================
-- -- Como usuario autenticado, estas vistas respetarán RLS del usuario:
-- select * from public.vw_leads_kpi;
-- select * from public.vw_leads_funnel;
-- -- Comprobar que las tasas no devuelven NaN cuando no hay datos (deben ser 0.00)
-- -- Comprobar que el conteo total coincide con count(*) de leads visibles para el usuario.
