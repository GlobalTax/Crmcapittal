-- Fix infinite recursion - Step 2: Create proper RLS policies using has_role_secure

-- Recreate user_roles policies (clean)
CREATE POLICY "users_view_own_roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_all_roles" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "superadmins_manage_roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role_secure(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Recreate leads policies (fixed)
CREATE POLICY "users_create_leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_view_assigned_leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to_id OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "admins_update_leads" 
ON public.leads 
FOR UPDATE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "admins_delete_leads" 
ON public.leads 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Recreate companies policies (fixed)
CREATE POLICY "users_create_companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_view_companies" 
ON public.companies 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id) OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "users_update_companies" 
ON public.companies 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id) OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "admins_delete_companies" 
ON public.companies 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Recreate buying_mandates policies (fixed)
CREATE POLICY "users_create_buying_mandates" 
ON public.buying_mandates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_view_buying_mandates" 
ON public.buying_mandates 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "users_update_buying_mandates" 
ON public.buying_mandates 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "admins_delete_buying_mandates" 
ON public.buying_mandates 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_mandates ENABLE ROW LEVEL SECURITY;