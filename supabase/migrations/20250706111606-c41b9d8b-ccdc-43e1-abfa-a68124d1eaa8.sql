-- Create table for storing company enrichment data
CREATE TABLE IF NOT EXISTS public.company_enrichments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  source TEXT NOT NULL DEFAULT 'einforma',
  enrichment_data JSONB NOT NULL,
  confidence_score NUMERIC,
  enrichment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_enrichments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view company enrichments" 
ON public.company_enrichments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create company enrichments" 
ON public.company_enrichments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update company enrichments" 
ON public.company_enrichments 
FOR UPDATE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_company_enrichments_updated_at
BEFORE UPDATE ON public.company_enrichments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();