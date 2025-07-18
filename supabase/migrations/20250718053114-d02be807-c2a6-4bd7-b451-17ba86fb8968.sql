-- Crear tablas para los nuevos servicios: Valoraciones, Reconversión y Sistema de Teaser

-- ===== TABLA DE VALORACIONES =====
CREATE TABLE public.valoraciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  company_name TEXT NOT NULL,
  company_sector TEXT,
  company_description TEXT,
  valuation_type TEXT NOT NULL DEFAULT 'standard', -- standard, detailed, express
  valuation_method TEXT[], -- ['multiples', 'dcf', 'market_comparison']
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  estimated_value_min NUMERIC,
  estimated_value_max NUMERIC,
  final_valuation_amount NUMERIC,
  valuation_report_url TEXT,
  status TEXT NOT NULL DEFAULT 'requested', -- requested, in_process, completed, delivered
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  notes TEXT,
  assigned_to UUID,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== TABLA DE RECONVERSIÓN =====
CREATE TABLE public.reconversiones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_lead_id UUID, -- Referencia al lead original que se descartó
  original_mandate_id UUID, -- Referencia al mandato original
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT,
  rejection_reason TEXT NOT NULL, -- Motivo por el que descartó la operación original
  new_requirements JSONB, -- Nuevos requisitos específicos del comprador
  target_sectors TEXT[],
  target_locations TEXT[],
  min_revenue NUMERIC,
  max_revenue NUMERIC,
  min_ebitda NUMERIC,
  max_ebitda NUMERIC,
  investment_capacity NUMERIC,
  deal_structure_preferences TEXT[], -- ['acquisition', 'partnership', 'merger']
  timeline_preference TEXT, -- 'immediate', 'short_term', 'medium_term', 'long_term'
  status TEXT NOT NULL DEFAULT 'active', -- active, matched, closed, paused
  conversion_probability INTEGER DEFAULT 50, -- 0-100 score
  next_contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  assigned_to UUID,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== TABLA DE TEASERS =====
CREATE TABLE public.teasers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id UUID NOT NULL, -- Referencia al mandato de venta
  teaser_name TEXT NOT NULL,
  project_code TEXT NOT NULL, -- e.g., "Proyecto IT", "Proyecto Alpha"
  company_description TEXT NOT NULL,
  business_model TEXT,
  key_investment_highlights TEXT[],
  sector TEXT,
  location TEXT,
  employees_count INTEGER,
  revenue_current NUMERIC,
  revenue_previous NUMERIC,
  ebitda_current NUMERIC,
  ebitda_previous NUMERIC,
  ebitda_margin NUMERIC,
  financial_data JSONB, -- Datos financieros históricos estructurados
  template_version TEXT DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, published, archived
  pdf_url TEXT, -- URL del PDF generado
  approval_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  version_number INTEGER DEFAULT 1,
  is_confidential BOOLEAN DEFAULT true,
  access_password TEXT, -- Para teasers protegidos por contraseña
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== TABLA DE ACCESO A TEASERS =====
CREATE TABLE public.teaser_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teaser_id UUID NOT NULL REFERENCES public.teasers(id) ON DELETE CASCADE,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  company_name TEXT,
  access_type TEXT NOT NULL DEFAULT 'view', -- view, download
  ip_address INET,
  user_agent TEXT,
  session_duration INTEGER, -- en segundos
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== TABLA DE TEMPLATES DE TEASER =====
CREATE TABLE public.teaser_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_description TEXT,
  template_content JSONB NOT NULL, -- Estructura del template en JSON
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== ÍNDICES =====
CREATE INDEX idx_valoraciones_status ON public.valoraciones(status);
CREATE INDEX idx_valoraciones_assigned_to ON public.valoraciones(assigned_to);
CREATE INDEX idx_valoraciones_created_by ON public.valoraciones(created_by);
CREATE INDEX idx_valoraciones_requested_date ON public.valoraciones(requested_date);

CREATE INDEX idx_reconversiones_status ON public.reconversiones(status);
CREATE INDEX idx_reconversiones_assigned_to ON public.reconversiones(assigned_to);
CREATE INDEX idx_reconversiones_original_lead_id ON public.reconversiones(original_lead_id);
CREATE INDEX idx_reconversiones_original_mandate_id ON public.reconversiones(original_mandate_id);

CREATE INDEX idx_teasers_mandate_id ON public.teasers(mandate_id);
CREATE INDEX idx_teasers_status ON public.teasers(status);
CREATE INDEX idx_teasers_created_by ON public.teasers(created_by);
CREATE INDEX idx_teasers_project_code ON public.teasers(project_code);

CREATE INDEX idx_teaser_access_logs_teaser_id ON public.teaser_access_logs(teaser_id);
CREATE INDEX idx_teaser_access_logs_accessed_at ON public.teaser_access_logs(accessed_at);

-- ===== RLS POLICIES =====

-- Políticas para valoraciones
ALTER TABLE public.valoraciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view valoraciones they created or are assigned to"
ON public.valoraciones
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

CREATE POLICY "Users can create valoraciones"
ON public.valoraciones
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update valoraciones they created or are assigned to"
ON public.valoraciones
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

CREATE POLICY "Admin users can delete valoraciones"
ON public.valoraciones
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas para reconversiones
ALTER TABLE public.reconversiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reconversiones they created or are assigned to"
ON public.reconversiones
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

CREATE POLICY "Users can create reconversiones"
ON public.reconversiones
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update reconversiones they created or are assigned to"
ON public.reconversiones
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

CREATE POLICY "Admin users can delete reconversiones"
ON public.reconversiones
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas para teasers
ALTER TABLE public.teasers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teasers they created or admin"
ON public.teasers
FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create teasers"
ON public.teasers
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update teasers they created or admin"
ON public.teasers
FOR UPDATE
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete teasers"
ON public.teasers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas para teaser access logs (solo admin)
ALTER TABLE public.teaser_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage teaser access logs"
ON public.teaser_access_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas para teaser templates
ALTER TABLE public.teaser_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teaser templates"
ON public.teaser_templates
FOR SELECT
USING (true);

CREATE POLICY "Admin users can manage teaser templates"
ON public.teaser_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ===== TRIGGERS =====

-- Trigger para actualizar updated_at en valoraciones
CREATE TRIGGER update_valoraciones_updated_at
    BEFORE UPDATE ON public.valoraciones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en reconversiones
CREATE TRIGGER update_reconversiones_updated_at
    BEFORE UPDATE ON public.reconversiones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en teasers
CREATE TRIGGER update_teasers_updated_at
    BEFORE UPDATE ON public.teasers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en teaser_templates
CREATE TRIGGER update_teaser_templates_updated_at
    BEFORE UPDATE ON public.teaser_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ===== INSERTAR TEMPLATES INICIALES =====

-- Template básico de teaser
INSERT INTO public.teaser_templates (template_name, template_description, template_content, is_default) VALUES (
  'Template Básico IT',
  'Template estándar para empresas del sector tecnología',
  '{
    "sections": [
      {
        "id": "header",
        "title": "Información General",
        "fields": ["project_code", "sector", "location"]
      },
      {
        "id": "description",
        "title": "Descripción del Negocio",
        "fields": ["company_description", "business_model"]
      },
      {
        "id": "highlights",
        "title": "Aspectos Clave de Inversión",
        "fields": ["key_investment_highlights"]
      },
      {
        "id": "metrics",
        "title": "Métricas Clave",
        "fields": ["employees_count", "revenue_current", "ebitda_current", "ebitda_margin"]
      },
      {
        "id": "financials",
        "title": "Datos Financieros",
        "fields": ["financial_data"]
      }
    ]
  }',
  true
);