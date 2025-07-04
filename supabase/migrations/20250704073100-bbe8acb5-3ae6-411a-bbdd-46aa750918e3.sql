-- Enable Row Level Security on vulnerable tables
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impuestos ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for clientes table
-- Only admin/superadmin users can access this sensitive data
CREATE POLICY "Admin users can view clientes" 
ON public.clientes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage clientes" 
ON public.clientes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create restrictive policies for impuestos table
-- Only admin/superadmin users can access this sensitive financial data
CREATE POLICY "Admin users can view impuestos" 
ON public.impuestos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage impuestos" 
ON public.impuestos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);