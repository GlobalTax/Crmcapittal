
-- Create enum for lead status
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  message TEXT,
  source TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'NEW',
  assigned_to_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy for viewing leads (admin and assigned users can see)
CREATE POLICY "Users can view leads they are assigned to or if admin" 
  ON public.leads 
  FOR SELECT 
  USING (
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Policy for creating leads (admin only)
CREATE POLICY "Admin users can create leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Policy for updating leads (admin and assigned users)
CREATE POLICY "Users can update leads they are assigned to or if admin" 
  ON public.leads 
  FOR UPDATE 
  USING (
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Policy for deleting leads (admin only)
CREATE POLICY "Admin users can delete leads" 
  ON public.leads 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add lead_id to contact_interactions table for activities
ALTER TABLE public.contact_interactions ADD COLUMN lead_id UUID REFERENCES public.leads(id);

-- Update the updated_at trigger for leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
