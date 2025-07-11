-- Add company_id to leads table for proper relationship with companies
ALTER TABLE public.leads 
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Add index for performance
CREATE INDEX idx_leads_company_id ON public.leads(company_id);