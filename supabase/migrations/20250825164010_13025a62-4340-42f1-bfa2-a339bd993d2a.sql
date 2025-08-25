-- Fix numeric overflow in leads.prob_conversion field
-- Simple approach: drop view, alter columns, create minimal view

-- 1. Drop the dependent view
DROP VIEW IF EXISTS public.vw_leads_kpi;

-- 2. Alter the column types to fix numeric overflow
ALTER TABLE public.leads 
ALTER COLUMN prob_conversion TYPE NUMERIC(5,2);

ALTER TABLE public.leads 
ALTER COLUMN probability TYPE NUMERIC(5,2);

-- 3. Add check constraints to ensure probabilities stay within reasonable bounds (0-100)
ALTER TABLE public.leads 
ADD CONSTRAINT check_prob_conversion_range 
CHECK (prob_conversion IS NULL OR (prob_conversion >= 0 AND prob_conversion <= 100));

ALTER TABLE public.leads 
ADD CONSTRAINT check_probability_range 
CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));

-- 4. Create a minimal placeholder view using actual column names
CREATE OR REPLACE VIEW public.vw_leads_kpi AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as leads_converted,
    COUNT(CASE WHEN status = 'LOST' THEN 1 END) as leads_lost,
    AVG(prob_conversion) as avg_conversion_probability,
    AVG(probability) as avg_probability,
    AVG(lead_score) as avg_lead_score
FROM public.leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';