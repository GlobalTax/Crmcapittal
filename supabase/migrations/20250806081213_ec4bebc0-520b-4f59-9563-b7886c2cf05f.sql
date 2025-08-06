-- CRITICAL SECURITY FIXES - Phase 3 (Final Fix)
-- Fix all SECURITY DEFINER views with correct column names and enum values

-- Drop and recreate vw_leads_kpi view with correct column names
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
        avg(lead_score) AS avg_lead_score,
        avg(prob_conversion) AS avg_prob_conversion
    FROM public.leads
    WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
)
SELECT * FROM lead_stats;

-- Now run the linter again to check if we've fixed all issues