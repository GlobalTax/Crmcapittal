-- Critical Security Fix: Implement RLS policies for exposed tables
-- Updated with correct column names based on actual table structure

-- 1. Enable RLS on operations table and create policies
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Operations policies - based on created_by and manager_id columns
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

-- 2. Enable RLS on deals table and create policies  
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Deals policies - based on created_by column
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

-- 3. Enable RLS on transacciones table and create policies
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

-- Transacciones policies - based on created_by and propietario_transaccion
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

-- 4. Enable RLS on negocios table and create policies
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

-- Negocios policies - based on created_by column
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