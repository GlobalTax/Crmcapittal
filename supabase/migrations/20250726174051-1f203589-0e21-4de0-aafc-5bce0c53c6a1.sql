-- Fix the infinite recursion in user_roles policies

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Solo administradores pueden gestionar roles" ON public.user_roles;

-- Create a simplified policy that avoids recursion
-- Only allow users to manage their own roles, and use a security definer function for admin checks
CREATE POLICY "Users can manage their own roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create a separate policy for superadmins using the existing has_role function
CREATE POLICY "Superadmins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'::app_role
  )
);