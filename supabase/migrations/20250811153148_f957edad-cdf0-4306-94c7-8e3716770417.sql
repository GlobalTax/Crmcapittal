-- Crear tabla de ingestión de leads
CREATE TABLE IF NOT EXISTS public.crm_inbound_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text,
  intent text NOT NULL,
  contact_name text,
  email text,
  phone text,
  company_name text,
  cif text,
  industry text,
  years_of_operation int,
  employee_range text,
  location text,
  revenue numeric,
  ebitda numeric,
  final_valuation numeric,
  valuation_range_min numeric,
  valuation_range_max numeric,
  ebitda_multiple_used numeric,
  utm jsonb,
  visitor_id text,
  payload jsonb,
  status text DEFAULT 'new'
);

-- Activar RLS
ALTER TABLE public.crm_inbound_leads ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas si existieran
DROP POLICY IF EXISTS "crm_inbound_leads_anyone_insert" ON public.crm_inbound_leads;
DROP POLICY IF EXISTS "crm_inbound_leads_admin_select" ON public.crm_inbound_leads;
DROP POLICY IF EXISTS "crm_inbound_leads_admin_update" ON public.crm_inbound_leads;
DROP POLICY IF EXISTS "crm_inbound_leads_admin_delete" ON public.crm_inbound_leads;

-- INSERT: cualquiera puede insertar
CREATE POLICY "crm_inbound_leads_anyone_insert"
ON public.crm_inbound_leads
FOR INSERT
TO public
WITH CHECK (true);

-- SELECT: solo admins/superadmins
CREATE POLICY "crm_inbound_leads_admin_select"
ON public.crm_inbound_leads
FOR SELECT
TO authenticated
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- UPDATE: solo admins/superadmins
CREATE POLICY "crm_inbound_leads_admin_update"
ON public.crm_inbound_leads
FOR UPDATE
TO authenticated
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- DELETE: solo admins/superadmins
CREATE POLICY "crm_inbound_leads_admin_delete"
ON public.crm_inbound_leads
FOR DELETE
TO authenticated
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);