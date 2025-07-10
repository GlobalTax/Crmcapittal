-- Create opportunities table based on existing deals structure but with proper opportunity fields
CREATE TABLE public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT NOT NULL DEFAULT 'deal',
  stage TEXT NOT NULL DEFAULT 'prospecting',
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  value BIGINT,
  currency TEXT DEFAULT 'EUR',
  close_date TIMESTAMP WITH TIME ZONE,
  probability INTEGER DEFAULT 50,
  
  -- Relations
  company_id UUID REFERENCES public.companies(id),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Deal-specific metadata
  deal_source TEXT,
  sector TEXT,
  location TEXT,
  employees INTEGER,
  revenue BIGINT,
  ebitda BIGINT,
  multiplier NUMERIC,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);
CREATE INDEX idx_opportunities_assigned_to ON public.opportunities(assigned_to);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_is_active ON public.opportunities(is_active);

-- Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunities
CREATE POLICY "Users can view opportunities they created or are assigned to" 
  ON public.opportunities 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create opportunities" 
  ON public.opportunities 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update opportunities they created or are assigned to" 
  ON public.opportunities 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admin users can delete opportunities" 
  ON public.opportunities 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Migrate data from deals to opportunities
INSERT INTO public.opportunities (
  title, description, value, currency, stage, company_id, created_by, 
  deal_source, sector, location, employees, revenue, ebitda, multiplier,
  created_at, updated_at, is_active, close_date
)
SELECT 
  deal_name as title,
  description,
  deal_value as value,
  currency,
  CASE 
    WHEN stage_id IN (SELECT id FROM stages WHERE name = 'Lead') THEN 'prospecting'
    WHEN stage_id IN (SELECT id FROM stages WHERE name = 'In Progress') THEN 'qualification'
    WHEN stage_id IN (SELECT id FROM stages WHERE name = 'Won') THEN 'closed_won'
    WHEN stage_id IN (SELECT id FROM stages WHERE name = 'Lost') THEN 'closed_lost'
    ELSE 'prospecting'
  END as stage,
  NULL as company_id, -- Will need to be mapped manually or via company name matching
  created_by,
  lead_source as deal_source,
  sector,
  location,
  employees,
  revenue,
  ebitda,
  multiplier,
  created_at,
  updated_at,
  is_active,
  close_date
FROM public.deals
WHERE is_active = true;

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();