-- Create proposal templates table
CREATE TABLE public.proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('M&A', 'Valoracion', 'Consultoria', 'Due Diligence', 'Legal')),
  practice_area_id UUID REFERENCES practice_areas(id),
  is_default BOOLEAN DEFAULT false,
  content_structure JSONB NOT NULL DEFAULT '[]',
  visual_config JSONB NOT NULL DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template sections lookup table
CREATE TABLE public.template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('text', 'services', 'fees', 'timeline', 'terms', 'signature')),
  title TEXT NOT NULL,
  content TEXT,
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposal_templates
CREATE POLICY "Users can view active templates" 
ON public.proposal_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create templates" 
ON public.proposal_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.proposal_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all templates" 
ON public.proposal_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- RLS Policies for template_sections
CREATE POLICY "Anyone can view template sections" 
ON public.template_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage template sections" 
ON public.template_sections 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- Insert default template sections
INSERT INTO public.template_sections (type, title, content, variables, is_system) VALUES
('text', 'Resumen Ejecutivo', 'Propuesta de servicios profesionales para {{cliente.nombre}} en el sector {{empresa.sector}}.', '["cliente.nombre", "empresa.sector", "fecha.hoy"]', true),
('services', 'Servicios Propuestos', 'Detalle de los servicios a prestar', '["servicios.lista", "metodologia"]', true),
('fees', 'Estructura de Honorarios', 'Detalle de la estructura de honorarios propuesta', '["honorarios.base", "honorarios.contingente", "honorarios.total"]', true),
('timeline', 'Timeline del Proyecto', 'Cronograma estimado de actividades', '["proyecto.duracion", "hitos.principales"]', true),
('terms', 'Términos y Condiciones', 'Condiciones generales del engagement', '["vigencia.propuesta", "condiciones.pago"]', true);

-- Insert default templates
INSERT INTO public.proposal_templates (name, description, category, content_structure, visual_config, is_default, created_by) VALUES
('M&A Advisory Standard', 'Template estándar para servicios de M&A', 'M&A', 
'[
  {"id": "1", "type": "text", "title": "Resumen Ejecutivo", "content": "Propuesta de servicios de M&A para {{cliente.nombre}}", "order": 1, "required": true},
  {"id": "2", "type": "services", "title": "Servicios de M&A", "content": "- Due Diligence Comercial\n- Estructuración de la transacción\n- Negociación y cierre", "order": 2, "required": true},
  {"id": "3", "type": "fees", "title": "Honorarios Contingentes", "content": "Success fee: {{honorarios.porcentaje}}% sobre valor transacción", "order": 3, "required": true},
  {"id": "4", "type": "timeline", "title": "Timeline", "content": "Duración estimada: {{proyecto.duracion}} meses", "order": 4, "required": true},
  {"id": "5", "type": "terms", "title": "Términos", "content": "Propuesta válida por {{vigencia.dias}} días", "order": 5, "required": true}
]',
'{"primary_color": "#2563eb", "secondary_color": "#64748b", "font_family": "Inter"}',
true, (SELECT id FROM auth.users LIMIT 1)),

('Company Valuation', 'Template para valoraciones de empresas', 'Valoracion',
'[
  {"id": "1", "type": "text", "title": "Objetivo de la Valoración", "content": "Valoración de {{empresa.nombre}} al {{fecha.valoracion}}", "order": 1, "required": true},
  {"id": "2", "type": "services", "title": "Metodología", "content": "- Análisis de comparables\n- Flujos de caja descontados (DCF)\n- Múltiplos de transacciones", "order": 2, "required": true},
  {"id": "3", "type": "fees", "title": "Honorarios Fijos", "content": "Honorarios: {{honorarios.fijos}}€ + IVA", "order": 3, "required": true},
  {"id": "4", "type": "timeline", "title": "Entregables", "content": "Informe de valoración en {{proyecto.semanas}} semanas", "order": 4, "required": true},
  {"id": "5", "type": "terms", "title": "Condiciones", "content": "50% al inicio, 50% a la entrega", "order": 5, "required": true}
]',
'{"primary_color": "#059669", "secondary_color": "#6b7280", "font_family": "Inter"}',
true, (SELECT id FROM auth.users LIMIT 1));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();