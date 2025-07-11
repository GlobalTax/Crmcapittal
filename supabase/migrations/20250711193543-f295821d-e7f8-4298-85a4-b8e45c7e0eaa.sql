-- Add user_id column to collaborators table to link users with their collaborator profile
ALTER TABLE public.collaborators 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index to ensure one collaborator per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_collaborators_user_id 
ON public.collaborators(user_id) 
WHERE user_id IS NOT NULL;

-- Update RLS policies for collaborator_commissions to allow users to see their own commissions
DROP POLICY IF EXISTS "Users can view all commissions" ON public.collaborator_commissions;

CREATE POLICY "Users can view relevant commissions" 
ON public.collaborator_commissions 
FOR SELECT 
USING (
  -- Admins can see all commissions
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ) 
  OR 
  -- Users can see commissions for their collaborator profile
  EXISTS (
    SELECT 1 FROM public.collaborators 
    WHERE collaborators.id = collaborator_commissions.collaborator_id 
    AND collaborators.user_id = auth.uid()
  )
);

-- Update the create policy to be more restrictive
DROP POLICY IF EXISTS "Users can create commissions" ON public.collaborator_commissions;

CREATE POLICY "Authorized users can create commissions" 
ON public.collaborator_commissions 
FOR INSERT 
WITH CHECK (
  -- Only admins can create commissions for others
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
  OR
  -- Users can create commissions for their own collaborator profile
  EXISTS (
    SELECT 1 FROM public.collaborators 
    WHERE collaborators.id = collaborator_commissions.collaborator_id 
    AND collaborators.user_id = auth.uid()
  )
);