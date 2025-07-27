-- Fix infinite recursion in user_roles RLS policies
-- Drop all existing RLS policies on user_roles that cause recursion
DROP POLICY IF EXISTS "Secure admin roles view" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage user roles" ON public.user_roles;

-- Create simple, non-recursive RLS policies using security definer functions
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles during signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can view all roles (using security definer function to avoid recursion)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Only superadmins can modify roles (using security definer function)
CREATE POLICY "Superadmins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role_secure(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;