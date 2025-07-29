-- Eliminar vistas existentes primero
DROP VIEW IF EXISTS public.vw_leads_kpi;
DROP VIEW IF EXISTS public.vw_leads_funnel;

-- Crear vista vw_leads_kpi para KPIs de leads
CREATE VIEW public.vw_leads_kpi AS
SELECT 
  -- Total leads activos
  COUNT(*) FILTER (WHERE status NOT IN ('DISQUALIFIED')) as total_leads,
  
  -- Leads hot (prioridad alta/urgente)
  COUNT(*) FILTER (WHERE priority IN ('high', 'urgent') AND status NOT IN ('DISQUALIFIED')) as hot_leads,
  
  -- Leads calificados/convertidos
  COUNT(*) FILTER (WHERE status = 'QUALIFIED') as qualified_leads,
  
  -- Tasa de conversión (%)
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'QUALIFIED')::numeric / COUNT(*)::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  
  -- Valor total del pipeline (suma de valores estimados de leads activos)
  COALESCE(SUM(CASE 
    WHEN status NOT IN ('DISQUALIFIED') THEN 
      COALESCE(deal_value, 0) 
    ELSE 0 
  END), 0) as pipeline_value

FROM public.leads
WHERE assigned_to_id = auth.uid();

-- Crear vista para datos del funnel por stages
CREATE VIEW public.vw_leads_funnel AS
SELECT 
  ps.name as stage_name,
  ps.order_index as stage_order,
  ps.color as stage_color,
  COUNT(l.id) as lead_count,
  ROUND(
    CASE 
      WHEN total_leads.total > 0 THEN 
        (COUNT(l.id)::numeric / total_leads.total::numeric) * 100 
      ELSE 0 
    END, 1
  ) as percentage
FROM public.pipeline_stages ps
LEFT JOIN public.leads l ON l.pipeline_stage_id = ps.id 
  AND l.assigned_to_id = auth.uid() 
  AND l.status NOT IN ('DISQUALIFIED')
CROSS JOIN (
  SELECT COUNT(*) as total 
  FROM public.leads 
  WHERE assigned_to_id = auth.uid() 
  AND status NOT IN ('DISQUALIFIED')
) total_leads
WHERE ps.pipeline_id IN (
  SELECT id FROM public.pipelines 
  WHERE type = 'LEAD' AND is_active = true
)
GROUP BY ps.id, ps.name, ps.order_index, ps.color, total_leads.total
ORDER BY ps.order_index;