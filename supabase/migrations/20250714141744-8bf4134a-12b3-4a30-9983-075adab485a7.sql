-- Add lead_name field to leads table for internal lead management
ALTER TABLE public.leads ADD COLUMN lead_name TEXT;

-- Update existing leads to have a lead_name based on their name and creation date
UPDATE public.leads 
SET lead_name = name || ' ' || TO_CHAR(created_at, 'DD/MM/YYYY')
WHERE lead_name IS NULL;