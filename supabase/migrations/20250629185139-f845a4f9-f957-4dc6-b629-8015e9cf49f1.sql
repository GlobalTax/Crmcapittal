
-- Crear enums para los tipos de empresa
CREATE TYPE public.company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');
CREATE TYPE public.company_type AS ENUM ('prospect', 'cliente', 'partner', 'franquicia', 'competidor');
CREATE TYPE public.company_status AS ENUM ('activa', 'inactiva', 'prospecto', 'cliente', 'perdida');
CREATE TYPE public.lifecycle_stage AS ENUM ('lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist');

-- Crear tabla companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información básica
  name TEXT NOT NULL,
  domain TEXT,
  website TEXT,
  description TEXT,
  
  -- Información de contacto
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'España',
  postal_code TEXT,
  
  -- Clasificación
  industry TEXT,
  company_size company_size NOT NULL DEFAULT '11-50',
  company_type company_type NOT NULL DEFAULT 'prospect',
  company_status company_status NOT NULL DEFAULT 'prospecto',
  lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'lead',
  
  -- Información financiera
  annual_revenue BIGINT,
  founded_year INTEGER,
  
  -- Asignación y propietario
  owner_id UUID,
  owner_name TEXT,
  
  -- Segmentación
  is_target_account BOOLEAN NOT NULL DEFAULT false,
  is_key_account BOOLEAN NOT NULL DEFAULT false,
  is_franquicia BOOLEAN NOT NULL DEFAULT false,
  
  -- Información adicional
  notes TEXT,
  tags TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  
  -- Métricas
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  
  -- Información de ciclo de vida
  first_contact_date TIMESTAMP WITH TIME ZONE,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Social media y enlaces
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT
);

-- Habilitar RLS en la tabla companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para companies
CREATE POLICY "Users can view companies" 
  ON public.companies 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create companies" 
  ON public.companies 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update companies" 
  ON public.companies 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete companies" 
  ON public.companies 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Agregar columna company_id a la tabla contacts para establecer relación
ALTER TABLE public.contacts 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Crear índices para mejorar performance
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_domain ON public.companies(domain);
CREATE INDEX idx_companies_company_type ON public.companies(company_type);
CREATE INDEX idx_companies_company_status ON public.companies(company_status);
CREATE INDEX idx_companies_lifecycle_stage ON public.companies(lifecycle_stage);
CREATE INDEX idx_companies_created_by ON public.companies(created_by);
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
