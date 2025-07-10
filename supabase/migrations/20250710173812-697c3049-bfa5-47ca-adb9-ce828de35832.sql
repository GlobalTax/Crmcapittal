-- First, let's create the missing opportunities table since it's referenced in the code
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  value NUMERIC,
  stage_id UUID,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  close_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for opportunities
CREATE POLICY "Users can view opportunities they created" 
ON public.opportunities 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create opportunities" 
ON public.opportunities 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their opportunities" 
ON public.opportunities 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their opportunities" 
ON public.opportunities 
FOR DELETE 
USING (auth.uid() = created_by);

-- Add trigger for updating updated_at
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some indexes for better performance
CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_contact_id ON public.opportunities(contact_id);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);
CREATE INDEX idx_opportunities_is_active ON public.opportunities(is_active);