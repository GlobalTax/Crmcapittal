
-- Create enum for target status
CREATE TYPE target_status AS ENUM (
  'IDENTIFIED',
  'RESEARCHING', 
  'OUTREACH_PLANNED',
  'CONTACTED',
  'IN_CONVERSATION',
  'ON_HOLD',
  'ARCHIVED',
  'CONVERTED_TO_DEAL'
);

-- Create target_companies table
CREATE TABLE public.target_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  industry TEXT,
  description TEXT,
  investment_thesis TEXT,
  fit_score INTEGER CHECK (fit_score >= 1 AND fit_score <= 5),
  status target_status NOT NULL DEFAULT 'IDENTIFIED',
  revenue DECIMAL,
  ebitda DECIMAL,
  source_notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create target_contacts table
CREATE TABLE public.target_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT UNIQUE,
  linkedin_url TEXT,
  target_company_id UUID NOT NULL REFERENCES public.target_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_target_companies_created_by ON public.target_companies(created_by_user_id);
CREATE INDEX idx_target_companies_status ON public.target_companies(status);
CREATE INDEX idx_target_companies_industry ON public.target_companies(industry);
CREATE INDEX idx_target_contacts_company ON public.target_contacts(target_company_id);
CREATE INDEX idx_target_contacts_email ON public.target_contacts(email);

-- Enable Row Level Security
ALTER TABLE public.target_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for target_companies
CREATE POLICY "Users can view all target companies" 
  ON public.target_companies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create target companies" 
  ON public.target_companies 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update target companies they created" 
  ON public.target_companies 
  FOR UPDATE 
  USING (created_by_user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete target companies they created" 
  ON public.target_companies 
  FOR DELETE 
  USING (created_by_user_id::text = auth.uid()::text);

-- RLS Policies for target_contacts
CREATE POLICY "Users can view all target contacts" 
  ON public.target_contacts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create target contacts" 
  ON public.target_contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update target contacts" 
  ON public.target_contacts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.target_companies 
      WHERE id = target_company_id 
      AND created_by_user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete target contacts" 
  ON public.target_contacts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.target_companies 
      WHERE id = target_company_id 
      AND created_by_user_id::text = auth.uid()::text
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_target_companies_updated_at 
  BEFORE UPDATE ON public.target_companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_contacts_updated_at 
  BEFORE UPDATE ON public.target_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
