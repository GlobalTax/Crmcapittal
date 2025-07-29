-- Recrear vista vw_leads_kpi manteniendo el orden exacto de columnas existente
CREATE OR REPLACE VIEW public.vw_leads_kpi AS
SELECT 
  ROUND(AVG(EXTRACT(DAYS FROM NOW() - created_at)), 1) as avg_dias_contacto,
  COUNT(*) FILTER (WHERE priority IN ('high', 'urgent') AND status NOT IN ('DISQUALIFIED')) as leads_hot,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'QUALIFIED')::numeric / COUNT(*)::numeric) * 100, 2)
    ELSE 0 
  END as tasa_conversion,
  COUNT(*) FILTER (WHERE status NOT IN ('DISQUALIFIED')) as total_leads,
  COALESCE(SUM(CASE 
    WHEN status NOT IN ('DISQUALIFIED') THEN COALESCE(deal_value, 0) 
    ELSE 0 
  END), 0) as valor_pipeline
FROM public.leads
WHERE assigned_to_id = auth.uid();