-- Create buying_mandates table
CREATE TABLE public.buying_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  mandate_name TEXT NOT NULL,
  target_sectors TEXT[] NOT NULL DEFAULT '{}',
  target_locations TEXT[] DEFAULT '{}',
  min_revenue NUMERIC,
  max_revenue NUMERIC,
  min_ebitda NUMERIC,
  max_ebitda NUMERIC,
  other_criteria TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mandate_targets table
CREATE TABLE public.mandate_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  sector TEXT,
  location TEXT,
  revenues NUMERIC,
  ebitda NUMERIC,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contacted BOOLEAN DEFAULT false,
  contact_date DATE,
  contact_method TEXT, -- email, phone, meeting, etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_analysis', 'interested', 'nda_signed', 'rejected', 'closed')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buying_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buying_mandates
CREATE POLICY "Users can view buying mandates they created or admin" 
ON public.buying_mandates FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create buying mandates" 
ON public.buying_mandates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their buying mandates or admin" 
ON public.buying_mandates FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete buying mandates" 
ON public.buying_mandates FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies for mandate_targets
CREATE POLICY "Users can view mandate targets for their mandates" 
ON public.mandate_targets FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Users can create mandate targets for their mandates" 
ON public.mandate_targets FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can update mandate targets for their mandates" 
ON public.mandate_targets FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Users can delete mandate targets for their mandates" 
ON public.mandate_targets FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_buying_mandates_updated_at
  BEFORE UPDATE ON public.buying_mandates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_targets_updated_at
  BEFORE UPDATE ON public.mandate_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();