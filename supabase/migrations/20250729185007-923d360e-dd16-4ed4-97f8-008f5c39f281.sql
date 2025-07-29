-- Crear nueva vista con nombre diferente para evitar conflictos
CREATE VIEW public.vw_dashboard_leads_kpi AS
SELECT 
  COUNT(*) FILTER (WHERE status NOT IN ('DISQUALIFIED')) as total_leads,
  COUNT(*) FILTER (WHERE priority IN ('high', 'urgent') AND status NOT IN ('DISQUALIFIED')) as hot_leads,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'QUALIFIED')::numeric / COUNT(*)::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  COALESCE(SUM(CASE 
    WHEN status NOT IN ('DISQUALIFIED') THEN COALESCE(deal_value, 0) 
    ELSE 0 
  END), 0) as pipeline_value
FROM public.leads
WHERE assigned_to_id = auth.uid();

-- Crear vista para datos del funnel
CREATE VIEW public.vw_dashboard_leads_funnel AS
SELECT 
  ps.name as stage_name,
  ps.stage_order,
  ps.color as stage_color,
  COUNT(l.id) as lead_count
FROM public.pipeline_stages ps
LEFT JOIN public.leads l ON l.pipeline_stage_id = ps.id 
  AND l.assigned_to_id = auth.uid() 
  AND l.status NOT IN ('DISQUALIFIED')
WHERE ps.is_active = true
GROUP BY ps.id, ps.name, ps.stage_order, ps.color
ORDER BY ps.stage_order;