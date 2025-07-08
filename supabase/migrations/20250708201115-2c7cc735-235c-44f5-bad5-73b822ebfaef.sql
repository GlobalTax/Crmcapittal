
-- Simplify and fix RLS policies for mandate_targets
-- The current policies are too complex and causing blocking issues

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "mandate_targets_select_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_insert_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_update_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "mandate_targets_delete_policy" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can view mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can create mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can update mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Admin users can delete mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can view mandate targets they created or from their mandates" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can insert mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can update mandate targets they created" ON public.mandate_targets;

-- Create simple, working RLS policies
-- Policy for SELECT - users can view targets from mandates they own
CREATE POLICY "mandate_targets_select_simple" 
ON public.mandate_targets FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND created_by = auth.uid()
    )
);

-- Policy for INSERT - users can create targets for their mandates
CREATE POLICY "mandate_targets_insert_simple" 
ON public.mandate_targets FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND created_by = auth.uid()
    )
);

-- Policy for UPDATE - users can update targets they created
CREATE POLICY "mandate_targets_update_simple" 
ON public.mandate_targets FOR UPDATE 
USING (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND created_by = auth.uid()
    )
);

-- Policy for DELETE - only admins can delete
CREATE POLICY "mandate_targets_delete_admin" 
ON public.mandate_targets FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    )
);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.mandate_targets TO authenticated;
GRANT DELETE ON public.mandate_targets TO authenticated;
