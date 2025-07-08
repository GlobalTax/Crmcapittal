-- Complete RLS policy fix for mandate_targets with superadmin support
-- The issue is that superadmins should be able to access ALL mandates and targets

-- First, verify the mandate_targets table structure and create if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'mandate_targets'
  ) THEN
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
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_analysis', 'interested', 'nda_signed', 'rejected', 'closed')),
      contacted BOOLEAN DEFAULT false,
      contact_date DATE,
      contact_method TEXT,
      notes TEXT,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.mandate_targets ENABLE ROW LEVEL SECURITY;
    
    -- Create trigger for updated_at
    CREATE TRIGGER update_mandate_targets_updated_at
      BEFORE UPDATE ON public.mandate_targets
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Drop ALL existing policies for mandate_targets to start completely fresh
DROP POLICY IF EXISTS "mandate_targets_select_simple" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_insert_simple" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_update_simple" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_delete_admin" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_select_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_insert_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_update_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_delete_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can view mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can create mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can update mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Admin users can delete mandate targets" ON public.mandate_targets;

-- Create comprehensive, working RLS policies that prioritize superadmin access
-- Policy for SELECT - superadmins see everything, users see their mandate targets
CREATE POLICY "mandate_targets_comprehensive_select" 
ON public.mandate_targets FOR SELECT 
USING (
  -- Superadmins can see everything
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
  OR
  -- Regular users can see targets from their mandates
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND created_by = auth.uid()
  )
);

-- Policy for INSERT - superadmins can create anywhere, users only for their mandates
CREATE POLICY "mandate_targets_comprehensive_insert" 
ON public.mandate_targets FOR INSERT 
WITH CHECK (
  -- Ensure created_by is set to current user
  auth.uid() = created_by AND
  (
    -- Superadmins can create targets for any mandate
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
    OR
    -- Regular users can create targets only for their mandates
    EXISTS (
      SELECT 1 FROM public.buying_mandates 
      WHERE id = mandate_targets.mandate_id 
      AND created_by = auth.uid()
    )
  )
);

-- Policy for UPDATE - superadmins can update everything, users only their targets
CREATE POLICY "mandate_targets_comprehensive_update" 
ON public.mandate_targets FOR UPDATE 
USING (
  -- Superadmins can update everything
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
  OR
  -- Regular users can update targets they created for their mandates
  (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.buying_mandates 
      WHERE id = mandate_targets.mandate_id 
      AND created_by = auth.uid()
    )
  )
);

-- Policy for DELETE - superadmins and admins can delete
CREATE POLICY "mandate_targets_comprehensive_delete" 
ON public.mandate_targets FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Grant comprehensive permissions
GRANT ALL ON public.mandate_targets TO authenticated;

-- Create useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_mandate_targets_mandate_id ON public.mandate_targets(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_targets_created_by ON public.mandate_targets(created_by);
CREATE INDEX IF NOT EXISTS idx_mandate_targets_status ON public.mandate_targets(status);

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for mandate_targets completely rebuilt with superadmin support';
  RAISE NOTICE 'User ID: 22873c0f-61da-4cd9-94d9-bcde55bc7ca8 should now have full access as superadmin';
END $$;