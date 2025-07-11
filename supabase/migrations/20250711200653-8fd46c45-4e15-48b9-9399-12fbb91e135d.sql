-- Create recipient type enum
CREATE TYPE public.recipient_type AS ENUM ('collaborator', 'employee');

-- Rename collaborator_commissions to commissions
ALTER TABLE public.collaborator_commissions RENAME TO commissions;

-- Add new columns
ALTER TABLE public.commissions 
ADD COLUMN employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN recipient_type recipient_type NOT NULL DEFAULT 'collaborator',
ADD COLUMN recipient_name TEXT;

-- Make collaborator_id nullable since now we can have employees
ALTER TABLE public.commissions ALTER COLUMN collaborator_id DROP NOT NULL;

-- Add constraint to ensure either collaborator_id or employee_id is set
ALTER TABLE public.commissions 
ADD CONSTRAINT check_recipient_id 
CHECK (
  (collaborator_id IS NOT NULL AND employee_id IS NULL AND recipient_type = 'collaborator') OR
  (employee_id IS NOT NULL AND collaborator_id IS NULL AND recipient_type = 'employee')
);

-- Update existing data to set recipient_name from collaborators
UPDATE public.commissions 
SET recipient_name = (
  SELECT name FROM public.collaborators 
  WHERE collaborators.id = commissions.collaborator_id
)
WHERE collaborator_id IS NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view relevant commissions" ON public.commissions;
DROP POLICY IF EXISTS "Authorized users can create commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admin users can update commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admin users can delete commissions" ON public.commissions;

-- Create new RLS policies for commissions table
CREATE POLICY "Users can view relevant commissions" 
ON public.commissions 
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
    WHERE collaborators.id = commissions.collaborator_id 
    AND collaborators.user_id = auth.uid()
  )
  OR
  -- Users can see their own employee commissions
  (commissions.employee_id = auth.uid())
);

CREATE POLICY "Authorized users can create commissions" 
ON public.commissions 
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
  (
    recipient_type = 'collaborator' AND
    EXISTS (
      SELECT 1 FROM public.collaborators 
      WHERE collaborators.id = commissions.collaborator_id 
      AND collaborators.user_id = auth.uid()
    )
  )
  OR
  -- Users can create employee commissions for themselves
  (recipient_type = 'employee' AND commissions.employee_id = auth.uid())
);

CREATE POLICY "Admin users can update commissions" 
ON public.commissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete commissions" 
ON public.commissions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);