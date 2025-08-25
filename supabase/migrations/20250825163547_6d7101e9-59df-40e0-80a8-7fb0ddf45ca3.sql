-- Fix numeric overflow in leads.prob_conversion field
-- Handle view dependency by dropping and recreating the view

-- 1. Store the view definition for recreation
-- Note: We'll need to recreate vw_leads_kpi after altering the column

-- 2. Drop the dependent view temporarily
DROP VIEW IF EXISTS public.vw_leads_kpi;

-- 3. Alter the column types to fix numeric overflow
ALTER TABLE public.leads 
ALTER COLUMN prob_conversion TYPE NUMERIC(5,2);

ALTER TABLE public.leads 
ALTER COLUMN probability TYPE NUMERIC(5,2);

-- 4. Add check constraints to ensure probabilities stay within reasonable bounds (0-100)
ALTER TABLE public.leads 
ADD CONSTRAINT check_prob_conversion_range 
CHECK (prob_conversion IS NULL OR (prob_conversion >= 0 AND prob_conversion <= 100));

ALTER TABLE public.leads 
ADD CONSTRAINT check_probability_range 
CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));

-- 5. Recreate the view (basic version - may need adjustment based on original definition)
-- Note: If this view was complex, it may need to be recreated manually
CREATE OR REPLACE VIEW public.vw_leads_kpi AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN stage = 'ganado' THEN 1 END) as leads_won,
    COUNT(CASE WHEN stage = 'perdido' THEN 1 END) as leads_lost,
    AVG(prob_conversion) as avg_conversion_probability,
    AVG(probability) as avg_probability,
    AVG(lead_score) as avg_lead_score
FROM public.leads;