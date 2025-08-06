-- CRITICAL SECURITY FIXES - Phase 3 (Fixed)
-- Fix all SECURITY DEFINER views with correct enum values

-- Drop and recreate security_events_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.security_events_summary CASCADE;
CREATE VIEW public.security_events_summary AS
SELECT 
    date_trunc('hour', created_at) AS hour,
    event_type,
    severity,
    count(*) AS event_count,
    count(DISTINCT user_id) AS unique_users,
    count(DISTINCT ip_address) AS unique_ips
FROM public.security_logs
WHERE created_at >= now() - interval '24 hours'
GROUP BY date_trunc('hour', created_at), event_type, severity
ORDER BY hour DESC, event_count DESC;

-- Drop and recreate security_status_summary view without SECURITY DEFINER  
DROP VIEW IF EXISTS public.security_status_summary CASCADE;
CREATE VIEW public.security_status_summary AS
SELECT 
    count(*) AS total_items,
    count(*) FILTER (WHERE status = 'completed') AS completed_items,
    count(*) FILTER (WHERE status = 'pending') AS pending_items,
    round(
        (count(*) FILTER (WHERE status = 'completed'))::numeric * 100.0 / 
        NULLIF(count(*), 0), 2
    ) AS completion_percentage
FROM (
    SELECT 'completed' as status FROM public.security_logs WHERE severity = 'low'
    UNION ALL
    SELECT 'pending' as status FROM public.security_logs WHERE severity IN ('medium', 'high', 'critical')
) security_status;

-- Drop and recreate vw_leads_kpi view with correct enum values
DROP VIEW IF EXISTS public.vw_leads_kpi CASCADE;
CREATE VIEW public.vw_leads_kpi AS
WITH lead_stats AS (
    SELECT 
        count(*) AS total_leads,
        count(*) FILTER (WHERE status = 'QUALIFIED') AS qualified_leads,
        count(*) FILTER (WHERE status = 'CONTACTED') AS contacted_leads,
        count(*) FILTER (WHERE status = 'DISQUALIFIED') AS disqualified_leads,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_leads_30d,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS new_leads_7d,
        avg(score) AS avg_score,
        avg(prob_conversion) AS avg_prob_conversion
    FROM public.leads
    WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
)
SELECT * FROM lead_stats;

-- Drop and recreate vw_leads_funnel view without SECURITY DEFINER
DROP VIEW IF EXISTS public.vw_leads_funnel CASCADE;
CREATE VIEW public.vw_leads_funnel AS
WITH stage_stats AS (
    SELECT 
        ps.id AS stage_id,
        ps.name AS stage_name,
        ps.stage_order,
        ps.color AS stage_color,
        count(l.id) AS lead_count,
        count(l.id) FILTER (WHERE l.created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_leads_30d
    FROM public.pipeline_stages ps
    LEFT JOIN public.leads l ON l.pipeline_stage_id = ps.id
    WHERE ps.is_active = true
    GROUP BY ps.id, ps.name, ps.stage_order, ps.color
)
SELECT * FROM stage_stats
ORDER BY stage_order;

-- Drop and recreate vw_reconversion_kpi_secure view without SECURITY DEFINER
DROP VIEW IF EXISTS public.vw_reconversion_kpi_secure CASCADE;
CREATE VIEW public.vw_reconversion_kpi_secure AS
SELECT 
    count(*) AS total,
    count(*) FILTER (WHERE estado = 'activa') AS activas,
    count(*) FILTER (WHERE estado = 'matching') AS matching,
    count(*) FILTER (WHERE estado = 'cerrada') AS cerradas,
    count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS nuevas_30d
FROM public.reconversiones_new
WHERE created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      public.has_role_secure(auth.uid(), 'admin') OR 
      public.has_role_secure(auth.uid(), 'superadmin');

-- Fix the last security definer view - check if hubspot views have the issue
DROP VIEW IF EXISTS public.hubspot_companies_with_stats CASCADE;
CREATE VIEW public.hubspot_companies_with_stats AS
SELECT 
    hc.id,
    hc.external_id as hubspot_id,
    hc.name,
    hc.domain,
    hc.industry,
    hc.phone,
    hc.city,
    hc.state,
    hc.country,
    hc.website,
    hc.description,
    hc.annual_revenue,
    hc.company_size,
    hc.founded_year,
    count(DISTINCT cont.id) as contact_count,
    count(DISTINCT deals.id) as deal_count
FROM public.companies hc
LEFT JOIN public.contacts cont ON cont.company_id = hc.id
LEFT JOIN public.deals deals ON deals.company_id = hc.id
WHERE hc.external_id IS NOT NULL
GROUP BY hc.id, hc.external_id, hc.name, hc.domain, hc.industry, hc.phone, 
         hc.city, hc.state, hc.country, hc.website, hc.description, 
         hc.annual_revenue, hc.company_size, hc.founded_year;