-- Create enhanced leads KPI view with trends and temporal analysis
CREATE OR REPLACE VIEW vw_leads_kpi AS
WITH lead_stats AS (
  SELECT 
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'QUALIFIED') as qualified_leads,
    COUNT(*) FILTER (WHERE lead_score >= 80) as hot_leads,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_leads_30d,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_leads_7d,
    AVG(lead_score) as avg_score,
    SUM(CASE WHEN status = 'QUALIFIED' THEN COALESCE(deal_value, 0) ELSE 0 END) as pipeline_value,
    AVG(EXTRACT(DAYS FROM NOW() - created_at)) FILTER (WHERE status = 'QUALIFIED') as avg_time_to_qualify
  FROM leads
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'
),
previous_month_stats AS (
  SELECT 
    COUNT(*) as prev_total_leads,
    COUNT(*) FILTER (WHERE status = 'QUALIFIED') as prev_qualified_leads
  FROM leads
  WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
    AND created_at < CURRENT_DATE - INTERVAL '30 days'
),
conversion_trends AS (
  SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'QUALIFIED') as qualified
  FROM leads
  WHERE created_at >= CURRENT_DATE - INTERVAL '8 weeks'
  GROUP BY DATE_TRUNC('week', created_at)
  ORDER BY week DESC
  LIMIT 4
)
SELECT 
  ls.total_leads,
  ls.qualified_leads,
  ls.hot_leads,
  ls.new_leads_30d,
  ls.new_leads_7d,
  ROUND(ls.avg_score, 1) as avg_score,
  COALESCE(ls.pipeline_value, 0) as pipeline_value,
  ROUND(
    CASE 
      WHEN ls.total_leads > 0 THEN (ls.qualified_leads::numeric / ls.total_leads::numeric) * 100 
      ELSE 0 
    END, 1
  ) as conversion_rate,
  ROUND(
    CASE 
      WHEN pms.prev_total_leads > 0 THEN 
        ((ls.new_leads_30d - pms.prev_total_leads)::numeric / pms.prev_total_leads::numeric) * 100 
      ELSE 0 
    END, 1
  ) as growth_rate_30d,
  ROUND(ls.avg_time_to_qualify, 1) as avg_time_to_qualify_days,
  CASE 
    WHEN ls.new_leads_7d > ls.new_leads_30d / 4 THEN 'up'
    WHEN ls.new_leads_7d < ls.new_leads_30d / 6 THEN 'down'
    ELSE 'stable'
  END as leads_trend,
  (
    SELECT json_agg(
      json_build_object(
        'week', to_char(week, 'YYYY-MM-DD'),
        'conversion_rate', 
        CASE WHEN total > 0 THEN ROUND((qualified::numeric / total::numeric) * 100, 1) ELSE 0 END
      ) ORDER BY week DESC
    )
    FROM conversion_trends
  ) as conversion_trend_data
FROM lead_stats ls
CROSS JOIN previous_month_stats pms;

-- Create enhanced funnel view with stage progression metrics
CREATE OR REPLACE VIEW vw_leads_funnel AS
WITH stage_stats AS (
  SELECT 
    ps.id as stage_id,
    ps.name as stage_name,
    ps.stage_order as stage_order,
    ps.color as stage_color,
    COUNT(l.id) as lead_count,
    AVG(l.lead_score) FILTER (WHERE l.lead_score IS NOT NULL) as avg_score,
    COUNT(l.id) FILTER (WHERE l.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_count
  FROM pipeline_stages ps
  LEFT JOIN leads l ON l.pipeline_stage_id = ps.id
  WHERE ps.is_active = true
  GROUP BY ps.id, ps.name, ps.stage_order, ps.color
),
stage_progression AS (
  SELECT 
    stage_id,
    stage_name,
    stage_order,
    stage_color,
    lead_count,
    ROUND(avg_score, 1) as avg_score,
    recent_count,
    LAG(lead_count) OVER (ORDER BY stage_order) as prev_stage_count,
    CASE 
      WHEN LAG(lead_count) OVER (ORDER BY stage_order) > 0 
      THEN ROUND((lead_count::numeric / LAG(lead_count) OVER (ORDER BY stage_order)::numeric) * 100, 1)
      ELSE 100
    END as stage_conversion_rate
  FROM stage_stats
)
SELECT 
  stage_id,
  stage_name,
  stage_order,
  stage_color,
  lead_count,
  avg_score,
  recent_count,
  stage_conversion_rate,
  CASE 
    WHEN stage_conversion_rate >= 70 THEN 'excellent'
    WHEN stage_conversion_rate >= 50 THEN 'good'
    WHEN stage_conversion_rate >= 30 THEN 'average'
    ELSE 'poor'
  END as performance_rating
FROM stage_progression
ORDER BY stage_order;