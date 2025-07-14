-- Fix RLS policies for leads table to allow users to create and see their own leads

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads they are assigned to or if admin" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads they are assigned to or if admin" ON public.leads;
DROP POLICY IF EXISTS "Admin users can delete leads" ON public.leads;

-- Create new policies that allow users to create and manage their own leads
CREATE POLICY "Users can create leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view leads they created, are assigned to, or if admin" 
  ON public.leads 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can update leads they created, are assigned to, or if admin" 
  ON public.leads 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can delete leads they created or if admin" 
  ON public.leads 
  FOR DELETE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Ensure leads table has created_by column (should already exist)
-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'leads' AND column_name = 'created_by') THEN
        ALTER TABLE public.leads ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;