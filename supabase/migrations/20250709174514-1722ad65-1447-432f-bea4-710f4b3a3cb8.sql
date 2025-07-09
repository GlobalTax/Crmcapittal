-- Fase 1: Expandir company_type enum
ALTER TYPE public.company_type ADD VALUE IF NOT EXISTS 'target';
ALTER TYPE public.company_type ADD VALUE IF NOT EXISTS 'cliente_comprador';
ALTER TYPE public.company_type ADD VALUE IF NOT EXISTS 'cliente_vendedor';

-- Crear nuevos enums para segmentación
CREATE TYPE public.business_segment AS ENUM (
  'pyme',
  'mid_market', 
  'enterprise',
  'family_office',
  'investment_fund'
);

CREATE TYPE public.transaction_interest AS ENUM (
  'compra',
  'venta', 
  'ambos',
  'ninguno'
);

CREATE TYPE public.geographic_scope AS ENUM (
  'local',
  'regional',
  'nacional', 
  'internacional'
);

CREATE TYPE public.ecosystem_role AS ENUM (
  'entrepreneur',
  'investor',
  'advisor',
  'broker',
  'lawyer',
  'banker'
);

CREATE TYPE public.mandate_relationship_type AS ENUM (
  'target',
  'buyer',
  'seller', 
  'advisor'
);

CREATE TYPE public.mandate_relationship_status AS ENUM (
  'potential',
  'active',
  'completed',
  'discarded'
);

-- Añadir nuevos campos a companies
ALTER TABLE public.companies 
ADD COLUMN business_segment public.business_segment,
ADD COLUMN transaction_interest public.transaction_interest DEFAULT 'ninguno',
ADD COLUMN geographic_scope public.geographic_scope DEFAULT 'nacional',
ADD COLUMN engagement_level INTEGER DEFAULT 0 CHECK (engagement_level >= 0 AND engagement_level <= 100),
ADD COLUMN deal_readiness_score INTEGER DEFAULT 0 CHECK (deal_readiness_score >= 0 AND deal_readiness_score <= 100),
ADD COLUMN network_strength INTEGER DEFAULT 0 CHECK (network_strength >= 0 AND network_strength <= 100);

-- Expandir contact_roles enum para añadir nuevos roles de ecosistema
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'decision_maker';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'influencer';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'gatekeeper';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'champion';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'ceo';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'cfo';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'board_member';
ALTER TYPE public.contact_role ADD VALUE IF NOT EXISTS 'broker';

-- Añadir nuevos campos a contacts
ALTER TABLE public.contacts
ADD COLUMN ecosystem_role public.ecosystem_role,
ADD COLUMN engagement_level INTEGER DEFAULT 0 CHECK (engagement_level >= 0 AND engagement_level <= 100),
ADD COLUMN network_connections INTEGER DEFAULT 0;

-- Crear tabla de relaciones empresa-mandato
CREATE TABLE public.company_mandates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  relationship_type public.mandate_relationship_type NOT NULL,
  status public.mandate_relationship_status NOT NULL DEFAULT 'potential',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, mandate_id, relationship_type)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_company_mandates_company ON public.company_mandates(company_id);
CREATE INDEX idx_company_mandates_mandate ON public.company_mandates(mandate_id);
CREATE INDEX idx_company_mandates_status ON public.company_mandates(status);
CREATE INDEX idx_companies_business_segment ON public.companies(business_segment);
CREATE INDEX idx_companies_transaction_interest ON public.companies(transaction_interest);
CREATE INDEX idx_contacts_ecosystem_role ON public.contacts(ecosystem_role);

-- Habilitar RLS en company_mandates
ALTER TABLE public.company_mandates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_mandates
CREATE POLICY "Users can view company mandates they created or admin"
  ON public.company_mandates 
  FOR SELECT 
  USING (
    (auth.uid() = created_by) OR 
    (EXISTS (
      SELECT 1 FROM public.buying_mandates 
      WHERE id = company_mandates.mandate_id 
      AND created_by = auth.uid()
    )) OR
    (EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_mandates.company_id 
      AND created_by = auth.uid()
    )) OR
    (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  );

CREATE POLICY "Users can create company mandates"
  ON public.company_mandates 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update company mandates they created or admin"
  ON public.company_mandates 
  FOR UPDATE 
  USING (
    (auth.uid() = created_by) OR 
    (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  );

CREATE POLICY "Admin users can delete company mandates"
  ON public.company_mandates 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_company_mandates_updated_at
  BEFORE UPDATE ON public.company_mandates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();