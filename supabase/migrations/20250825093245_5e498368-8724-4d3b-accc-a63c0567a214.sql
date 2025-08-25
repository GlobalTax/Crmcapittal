-- Fix numeric overflow in leads.prob_conversion field
-- Change from NUMERIC(3,2) to NUMERIC(5,2) to allow values up to 999.99

ALTER TABLE public.leads 
ALTER COLUMN prob_conversion TYPE NUMERIC(5,2);

-- Also ensure probability field has consistent precision
ALTER TABLE public.leads 
ALTER COLUMN probability TYPE NUMERIC(5,2);

-- Add a check constraint to ensure probabilities stay within reasonable bounds (0-100)
ALTER TABLE public.leads 
ADD CONSTRAINT check_prob_conversion_range 
CHECK (prob_conversion IS NULL OR (prob_conversion >= 0 AND prob_conversion <= 100));

ALTER TABLE public.leads 
ADD CONSTRAINT check_probability_range 
CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));