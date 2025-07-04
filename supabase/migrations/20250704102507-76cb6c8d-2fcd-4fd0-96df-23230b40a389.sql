-- Security Fix: Enable RLS and create proper policies for unprotected tables

-- Enable RLS on tables that don't have it
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_integraloop ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for financial data (cuentas)
-- Only admin/superadmin users can access this sensitive financial data
CREATE POLICY "Admin users can view cuentas" 
ON public.cuentas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage cuentas" 
ON public.cuentas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create restrictive policies for customers
-- Only admin/superadmin users can access customer data
CREATE POLICY "Admin users can view customers" 
ON public.customers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage customers" 
ON public.customers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create restrictive policies for empresas
-- Only admin/superadmin users can access company data
CREATE POLICY "Admin users can view empresas" 
ON public.empresas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage empresas" 
ON public.empresas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create restrictive policies for empresas_integraloop
-- Only admin/superadmin users can access this integration data
CREATE POLICY "Admin users can view empresas_integraloop" 
ON public.empresas_integraloop 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage empresas_integraloop" 
ON public.empresas_integraloop 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Fix overly permissive policies on cases table
-- Remove the overly broad policy and replace with proper checks
DROP POLICY IF EXISTS "Users can manage cases" ON public.cases;
DROP POLICY IF EXISTS "Users can view cases" ON public.cases;

-- Create proper user-based policies for cases
CREATE POLICY "Users can view cases they created or are assigned to" 
ON public.cases 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update cases they created or are assigned to" 
ON public.cases 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete cases" 
ON public.cases 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Fix overly permissive policies on companies table
-- Remove overly broad policies and add proper restrictions
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete companies" ON public.companies;

-- Create proper user-based policies for companies
-- Fixed UUID comparison issue
CREATE POLICY "Users can view companies they created or own" 
ON public.companies 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id::uuid) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can update companies they created or own" 
ON public.companies 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  (owner_id IS NOT NULL AND auth.uid() = owner_id::uuid) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete companies" 
ON public.companies 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Strengthen operations table policies
-- Remove overly broad manager viewing policy
DROP POLICY IF EXISTS "Anyone can view managers" ON public.operation_managers;

-- Create more restrictive policy for operation managers
CREATE POLICY "Authenticated users can view managers" 
ON public.operation_managers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add authentication requirement to document access logs
DROP POLICY IF EXISTS "Anyone can insert document_access_logs" ON public.document_access_logs;

CREATE POLICY "System can insert document_access_logs" 
ON public.document_access_logs 
FOR INSERT 
WITH CHECK (true); -- Allow system inserts but require authentication for reads

CREATE POLICY "Users can view document access logs" 
ON public.document_access_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Add authentication requirement to lead activities
DROP POLICY IF EXISTS "Users can insert lead activities" ON public.lead_activities;

CREATE POLICY "Authenticated users can insert lead activities" 
ON public.lead_activities 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view lead activities they created or admin" 
ON public.lead_activities 
FOR SELECT 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);