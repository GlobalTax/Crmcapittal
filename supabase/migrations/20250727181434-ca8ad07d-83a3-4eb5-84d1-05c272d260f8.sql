-- Fix infinite recursion in all tables with problematic RLS policies
-- This comprehensive fix addresses all tables causing 500 errors

-- First, drop all problematic policies that directly query user_roles table

-- Fix leads table policies
DROP POLICY IF EXISTS "Admin users can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admin users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view assigned leads or admin" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;

-- Fix companies table policies  
DROP POLICY IF EXISTS "Admin users can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update companies they created or own" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they created or own" ON public.companies;

-- Fix buying_mandates table policies
DROP POLICY IF EXISTS "Admin users can delete buying mandates" ON public.buying_mandates;
DROP POLICY IF EXISTS "Users can update their buying mandates or admin" ON public.buying_mandates;
DROP POLICY IF EXISTS "Users can view buying mandates they created or admin" ON public.buying_mandates;

-- Fix other critical tables with similar issues
DROP POLICY IF EXISTS "Admin users can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admin users can delete cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update cases they created or are assigned to" ON public.cases;
DROP POLICY IF EXISTS "Users can view cases they created or are assigned to" ON public.cases;
DROP POLICY IF EXISTS "Admin users can manage clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can view clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can delete collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can update their own collaborators or admins" ON public.collaborators;
DROP POLICY IF EXISTS "Admin users can delete commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admin users can update commissions" ON public.commissions;
DROP POLICY IF EXISTS "Authorized users can create commissions" ON public.commissions;
DROP POLICY IF EXISTS "Users can view relevant commissions" ON public.commissions;

-- Drop duplicate user_roles policies first
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage roles" ON public.user_roles;

-- Recreate user_roles policies (clean up duplicates)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles during signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Superadmins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role_secure(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Now recreate all policies using has_role_secure function

-- Leads table policies (fixed)
CREATE POLICY "Users can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view assigned leads or admin" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to_id OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete leads" 
ON public.leads 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Companies table policies (fixed)
CREATE POLICY "Users can view companies they created or own" 
ON public.companies 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id) OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can update companies they created or own" 
ON public.companies 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id) OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete companies" 
ON public.companies 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Buying mandates policies (fixed)
CREATE POLICY "Users can view buying mandates they created or admin" 
ON public.buying_mandates 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can update their buying mandates or admin" 
ON public.buying_mandates 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete buying mandates" 
ON public.buying_mandates 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Campaigns policies (fixed)
CREATE POLICY "Admin users can manage campaigns" 
ON public.campaigns 
FOR ALL 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Cases policies (fixed)
CREATE POLICY "Users can view cases they created or are assigned to" 
ON public.cases 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can update cases they created or are assigned to" 
ON public.cases 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete cases" 
ON public.cases 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Clientes policies (fixed)
CREATE POLICY "Admin users can view clientes" 
ON public.clientes 
FOR SELECT 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can manage clientes" 
ON public.clientes 
FOR ALL 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Collaborators policies (fixed)
CREATE POLICY "Users can update their own collaborators or admins" 
ON public.collaborators 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete collaborators" 
ON public.collaborators 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Commissions policies (fixed)
CREATE POLICY "Users can view relevant commissions" 
ON public.commissions 
FOR SELECT 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role) OR 
  (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.id = commissions.collaborator_id AND collaborators.user_id = auth.uid())) OR 
  employee_id = auth.uid()
);

CREATE POLICY "Authorized users can create commissions" 
ON public.commissions 
FOR INSERT 
WITH CHECK (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role) OR 
  (recipient_type = 'collaborator' AND EXISTS (SELECT 1 FROM collaborators WHERE collaborators.id = commissions.collaborator_id AND collaborators.user_id = auth.uid())) OR 
  (recipient_type = 'employee' AND employee_id = auth.uid())
);

CREATE POLICY "Admin users can update commissions" 
ON public.commissions 
FOR UPDATE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admin users can delete commissions" 
ON public.commissions 
FOR DELETE 
USING (
  public.has_role_secure(auth.uid(), 'admin'::app_role) OR 
  public.has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Ensure RLS is enabled on all affected tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;