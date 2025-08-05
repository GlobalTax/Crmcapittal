-- Políticas RLS mejoradas para limitar acceso por roles

-- 1. Tabla users: Solo admins pueden ver todos los usuarios
DROP POLICY IF EXISTS "users_view_companies" ON public.companies;
CREATE POLICY "users_view_companies" ON public.companies
FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = owner_id OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 2. Contacts: usuarios ven solo sus contactos
DROP POLICY IF EXISTS "Users can view contact notes" ON public.contact_notes;
CREATE POLICY "Users can view contact notes" ON public.contact_notes
FOR SELECT USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM contacts WHERE id = contact_notes.contact_id AND created_by = auth.uid()) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 3. Leads: usuarios ven solo sus leads
CREATE POLICY "users_view_own_leads" ON public.leads
FOR SELECT USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 4. Operations: usuarios ven solo sus operaciones  
CREATE POLICY "users_view_own_operations" ON public.operations
FOR SELECT USING (
  created_by = auth.uid() OR
  assigned_to = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 5. Buying mandates: usuarios ven solo sus mandatos
DROP POLICY IF EXISTS "users_view_buying_mandates" ON public.buying_mandates;
CREATE POLICY "users_view_buying_mandates" ON public.buying_mandates
FOR SELECT USING (
  created_by = auth.uid() OR 
  assigned_user_id = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);