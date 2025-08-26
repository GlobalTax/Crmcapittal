-- Critical Security Fix: Clean and implement RLS policies for exposed tables
-- Drop existing policies first, then recreate with correct structure

-- 1. Clean and setup operations table
DROP POLICY IF EXISTS "Users can view their own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can create operations" ON public.operations;
DROP POLICY IF EXISTS "Users can update their own operations" ON public.operations;
DROP POLICY IF EXISTS "Admins can delete operations" ON public.operations;

ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own operations" 
ON public.operations 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = manager_id OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create operations" 
ON public.operations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own operations" 
ON public.operations 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  auth.uid() = manager_id OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admins can delete operations" 
ON public.operations 
FOR DELETE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 2. Clean and setup deals table
DROP POLICY IF EXISTS "Users can view accessible deals" ON public.deals;
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can create deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update accessible deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Admins can delete deals" ON public.deals;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals" 
ON public.deals 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own deals" 
ON public.deals 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admins can delete deals" 
ON public.deals 
FOR DELETE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 3. Clean and setup transacciones table  
DROP POLICY IF EXISTS "Users can view their transacciones" ON public.transacciones;
DROP POLICY IF EXISTS "Users can create transacciones" ON public.transacciones;
DROP POLICY IF EXISTS "Users can update their transacciones" ON public.transacciones;
DROP POLICY IF EXISTS "Admins can delete transacciones" ON public.transacciones;

ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transacciones" 
ON public.transacciones 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create transacciones" 
ON public.transacciones 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their transacciones" 
ON public.transacciones 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admins can delete transacciones" 
ON public.transacciones 
FOR DELETE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 4. Clean and setup negocios table
DROP POLICY IF EXISTS "Users can view their negocios" ON public.negocios;
DROP POLICY IF EXISTS "Users can create negocios" ON public.negocios;
DROP POLICY IF EXISTS "Users can update their negocios" ON public.negocios;
DROP POLICY IF EXISTS "Admins can delete negocios" ON public.negocios;

ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their negocios" 
ON public.negocios 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create negocios" 
ON public.negocios 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their negocios" 
ON public.negocios 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Admins can delete negocios" 
ON public.negocios 
FOR DELETE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);