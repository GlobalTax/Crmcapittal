-- Paso 1: Crear tabla unificada de oportunidades
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT NOT NULL DEFAULT 'deal', -- 'deal', 'negocio', 'transaction'
  stage TEXT NOT NULL DEFAULT 'prospecting',
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  value BIGINT,
  currency TEXT DEFAULT 'EUR',
  close_date TIMESTAMP WITH TIME ZONE,
  probability INTEGER DEFAULT 0,
  
  -- Relaciones
  company_id UUID REFERENCES public.companies(id),
  created_by UUID,
  assigned_to UUID,
  
  -- Metadatos específicos por tipo
  deal_source TEXT,
  sector TEXT,
  location TEXT,
  employees INTEGER,
  revenue BIGINT,
  ebitda BIGINT,
  multiplier NUMERIC,
  
  -- Campos de auditoría
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Paso 2: Crear tabla de relación contactos-oportunidades
CREATE TABLE public.opportunity_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contact', -- 'decision_maker', 'influencer', 'champion', 'advisor', 'legal', 'contact'
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(opportunity_id, contact_id, role)
);

-- Paso 3: Habilitar RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_contacts ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas RLS para opportunities
CREATE POLICY "Users can view opportunities they created or are assigned to"
ON public.opportunities FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create opportunities"
ON public.opportunities FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update opportunities they created or are assigned to"
ON public.opportunities FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete opportunities"
ON public.opportunities FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Paso 5: Crear políticas RLS para opportunity_contacts
CREATE POLICY "Users can view opportunity contacts for their opportunities"
ON public.opportunity_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_contacts.opportunity_id
    AND (o.created_by = auth.uid() OR o.assigned_to = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create opportunity contacts for their opportunities"
ON public.opportunity_contacts FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_contacts.opportunity_id
    AND (o.created_by = auth.uid() OR o.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can update opportunity contacts for their opportunities"
ON public.opportunity_contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_contacts.opportunity_id
    AND (o.created_by = auth.uid() OR o.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can delete opportunity contacts for their opportunities"
ON public.opportunity_contacts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_contacts.opportunity_id
    AND (o.created_by = auth.uid() OR o.assigned_to = auth.uid())
  )
);

-- Paso 6: Migrar datos existentes de deals
INSERT INTO public.opportunities (
  id, title, description, opportunity_type, stage, status, priority, value, currency, close_date,
  company_id, created_by, deal_source, sector, location, employees, revenue, ebitda, multiplier,
  created_at, updated_at, is_active
)
SELECT 
  id, 
  COALESCE(deal_name, 'Deal sin nombre'),
  description,
  'deal',
  CASE 
    WHEN stage_id IS NOT NULL THEN 'in_progress'
    ELSE 'prospecting'
  END,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
  priority,
  deal_value,
  COALESCE(currency, 'EUR'),
  close_date,
  NULL, -- company_id será asignado después
  created_by,
  lead_source,
  sector,
  location,
  employees,
  revenue,
  ebitda,
  multiplier,
  created_at,
  updated_at,
  is_active
FROM public.deals WHERE is_active = true;

-- Migrar relaciones de contactos de deals
INSERT INTO public.opportunity_contacts (opportunity_id, contact_id, role, is_primary, created_by)
SELECT 
  d.id,
  c.id,
  'contact',
  true,
  d.created_by
FROM public.deals d
JOIN public.contacts c ON (
  c.name = d.contact_name OR 
  c.email = d.contact_email OR 
  c.phone = d.contact_phone
)
WHERE d.is_active = true AND (d.contact_name IS NOT NULL OR d.contact_email IS NOT NULL);

-- Paso 7: Crear índices para optimizar consultas
CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);
CREATE INDEX idx_opportunities_assigned_to ON public.opportunities(assigned_to);
CREATE INDEX idx_opportunities_type_status ON public.opportunities(opportunity_type, status);
CREATE INDEX idx_opportunity_contacts_opportunity_id ON public.opportunity_contacts(opportunity_id);
CREATE INDEX idx_opportunity_contacts_contact_id ON public.opportunity_contacts(contact_id);

-- Paso 8: Crear trigger para updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Paso 9: Añadir constraint para asegurar que company_id esté presente
-- (Se añadirá después de migrar y asociar todas las empresas)