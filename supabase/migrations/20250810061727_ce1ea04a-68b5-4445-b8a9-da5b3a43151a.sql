-- Corrección: recrear vw_leads_funnel sin depender de columna inexistente 'stage'
DROP VIEW IF EXISTS public.vw_leads_funnel CASCADE;
CREATE VIEW public.vw_leads_funnel AS
WITH base AS (
  SELECT 
    id,
    pipeline_stage_id,
    CASE WHEN pipeline_stage_id IS NOT NULL THEN 'PIPE_' || (pipeline_stage_id::text) ELSE 'UNKNOWN' END AS stage_label
  FROM public.leads
), totals AS (
  SELECT COUNT(*) AS total FROM base
)
SELECT 
  b.pipeline_stage_id,
  b.stage_label,
  COUNT(*) AS stage_count,
  ROUND((COUNT(*)::numeric / NULLIF(t.total,0)) * 100, 2) AS stage_percent
FROM base b
CROSS JOIN totals t
GROUP BY b.pipeline_stage_id, b.stage_label, t.total
ORDER BY stage_count DESC;

COMMENT ON VIEW public.vw_leads_funnel IS 'Distribución de leads por pipeline_stage_id (o UNKNOWN si nulo) con porcentaje sobre el total visible por RLS.';