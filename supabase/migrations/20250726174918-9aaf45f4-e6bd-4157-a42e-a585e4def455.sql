-- Remove only the problematic recursive policies on user_roles
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON public.user_roles;