-- Políticas RLS corregidas para limitar acceso por roles

-- 1. Habilitar RLS en tablas principales si no está habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- 2. Leads: usuarios ven solo sus leads
DROP POLICY IF EXISTS "users_view_own_leads" ON public.leads;
CREATE POLICY "users_view_own_leads" ON public.leads
FOR SELECT USING (
  created_by = auth.uid() OR
  assigned_to_id = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 3. Operations: usuarios ven solo sus operaciones  
DROP POLICY IF EXISTS "users_view_own_operations" ON public.operations;
CREATE POLICY "users_view_own_operations" ON public.operations
FOR SELECT USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 4. Commissions: usuarios solo ven sus comisiones
DROP POLICY IF EXISTS "Users can view relevant commissions" ON public.commissions;
CREATE POLICY "Users can view relevant commissions" ON public.commissions
FOR SELECT USING (
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role]))) OR 
  (EXISTS (SELECT 1 FROM collaborators WHERE id = commissions.collaborator_id AND user_id = auth.uid())) OR 
  (employee_id = auth.uid())
);