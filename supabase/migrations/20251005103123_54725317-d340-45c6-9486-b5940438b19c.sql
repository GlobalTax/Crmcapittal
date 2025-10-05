-- Fix the foreign key relationship between target_contacts and target_companies
-- This ensures Supabase can properly join these tables

-- First, check if target_companies table exists and add it if not
CREATE TABLE IF NOT EXISTS public.target_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT,
  revenue NUMERIC,
  ebitda NUMERIC,
  fit_score INTEGER,
  status TEXT NOT NULL DEFAULT 'IDENTIFIED',
  stage_id UUID,
  investment_thesis TEXT,
  source_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_user_id UUID NOT NULL
);

-- Enable RLS on target_companies
ALTER TABLE public.target_companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for target_companies
DROP POLICY IF EXISTS "Users can manage their own target companies" ON public.target_companies;
CREATE POLICY "Users can manage their own target companies"
  ON public.target_companies
  FOR ALL
  USING (auth.uid() = created_by_user_id);

-- Create target_contacts table with proper foreign key
CREATE TABLE IF NOT EXISTS public.target_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  target_company_id UUID NOT NULL REFERENCES public.target_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on target_contacts
ALTER TABLE public.target_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for target_contacts
DROP POLICY IF EXISTS "Users can manage contacts for their companies" ON public.target_contacts;
CREATE POLICY "Users can manage contacts for their companies"
  ON public.target_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.target_companies
      WHERE target_companies.id = target_contacts.target_company_id
      AND target_companies.created_by_user_id = auth.uid()
    )
  );

-- Create stages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for stage_id if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'target_companies_stage_id_fkey'
  ) THEN
    ALTER TABLE public.target_companies 
    ADD CONSTRAINT target_companies_stage_id_fkey 
    FOREIGN KEY (stage_id) REFERENCES public.stages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_target_contacts_company_id ON public.target_contacts(target_company_id);
CREATE INDEX IF NOT EXISTS idx_target_companies_created_by ON public.target_companies(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_target_companies_stage_id ON public.target_companies(stage_id);