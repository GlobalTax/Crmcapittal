-- Remove the problematic recursive policy on user_roles that's causing infinite recursion
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;

-- Also remove any other potentially problematic policies
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON public.user_roles;

-- Keep only the safe policy that allows users to manage their own roles
-- The "Users can manage their own roles" policy should remain as it only uses auth.uid()

-- Create a simple read policy for users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- For admin operations, we'll rely on the security definer function get_user_highest_role
-- which can safely query user_roles without causing recursion in policies