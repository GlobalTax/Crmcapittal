-- Crear vista para KPIs de leads
CREATE OR REPLACE VIEW public.vw_leads_kpi AS
WITH lead_metrics AS (
  SELECT 
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE lead_score > 70) as leads_hot,
    COUNT(*) FILTER (WHERE status IN ('QUALIFIED', 'CONVERTED')) as leads_qualified,
    AVG(
      CASE 
        WHEN next_contact_date IS NOT NULL 
        THEN EXTRACT(DAY FROM next_contact_date - created_at)
        ELSE NULL 
      END
    ) as avg_dias_contacto
  FROM public.leads
  WHERE created_at >= NOW() - INTERVAL '12 months'
),
pipeline_metrics AS (
  SELECT 
    COALESCE(SUM(deal_value), 0) as valor_pipeline
  FROM public.deals
  WHERE is_active = true 
    AND deal_type = 'venta'
    AND created_at >= NOW() - INTERVAL '12 months'
)
SELECT 
  lm.total_leads,
  lm.leads_hot,
  CASE 
    WHEN lm.total_leads > 0 
    THEN ROUND((lm.leads_qualified::numeric / lm.total_leads::numeric) * 100, 2)
    ELSE 0 
  END as tasa_conversion,
  COALESCE(ROUND(lm.avg_dias_contacto, 1), 0) as avg_dias_contacto,
  pm.valor_pipeline
FROM lead_metrics lm
CROSS JOIN pipeline_metrics pm;

-- Crear política RLS para la vista
CREATE POLICY "Users can view leads KPI" ON public.vw_leads_kpi
  FOR SELECT USING (true);