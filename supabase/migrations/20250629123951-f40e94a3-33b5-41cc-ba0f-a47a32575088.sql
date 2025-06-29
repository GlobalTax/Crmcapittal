
-- Crear tabla de pipelines
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('OPERACION', 'PROYECTO', 'LEAD', 'TARGET_COMPANY')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de stages (etapas)
CREATE TABLE public.stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar campo stage_id a la tabla operations existente
ALTER TABLE public.operations 
ADD COLUMN stage_id UUID REFERENCES public.stages(id);

-- Agregar campo stage_id a la tabla target_companies existente
ALTER TABLE public.target_companies 
ADD COLUMN stage_id UUID REFERENCES public.stages(id);

-- Agregar campo stage_id a la tabla leads existente
ALTER TABLE public.leads 
ADD COLUMN stage_id UUID REFERENCES public.stages(id);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_stages_pipeline_id ON public.stages(pipeline_id);
CREATE INDEX idx_stages_order ON public.stages(pipeline_id, order_index);
CREATE INDEX idx_operations_stage_id ON public.operations(stage_id);
CREATE INDEX idx_target_companies_stage_id ON public.target_companies(stage_id);
CREATE INDEX idx_leads_stage_id ON public.leads(stage_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pipelines
CREATE POLICY "Users can view all pipelines" 
ON public.pipelines FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage pipelines" 
ON public.pipelines FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas RLS para stages
CREATE POLICY "Users can view all stages" 
ON public.stages FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage stages" 
ON public.stages FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insertar pipelines por defecto
INSERT INTO public.pipelines (name, type, description) VALUES
('Pipeline de Operaciones M&A', 'OPERACION', 'Pipeline principal para operaciones de M&A'),
('Pipeline de Empresas Objetivo', 'TARGET_COMPANY', 'Pipeline para el proceso de sourcing de empresas objetivo'),
('Pipeline de Leads', 'LEAD', 'Pipeline para gestión de leads entrantes'),
('Pipeline de Proyectos', 'PROYECTO', 'Pipeline para gestión de proyectos internos');

-- Insertar stages por defecto para el pipeline de operaciones
INSERT INTO public.stages (name, order_index, color, pipeline_id, description) 
SELECT 
  stage_name, 
  stage_order, 
  stage_color, 
  p.id,
  stage_desc
FROM (
  VALUES 
    ('Prospecto', 1, '#6B7280', 'Operación identificada pero no iniciada'),
    ('Análisis Inicial', 2, '#3B82F6', 'Evaluación preliminar de la operación'),
    ('Due Diligence', 3, '#F59E0B', 'Proceso de due diligence en curso'),
    ('Negociación', 4, '#EF4444', 'Negociación de términos y condiciones'),
    ('Cierre', 5, '#10B981', 'Finalización de la operación'),
    ('Cerrado', 6, '#8B5CF6', 'Operación completada exitosamente')
) AS stages(stage_name, stage_order, stage_color, stage_desc)
JOIN public.pipelines p ON p.name = 'Pipeline de Operaciones M&A';

-- Insertar stages por defecto para el pipeline de empresas objetivo
INSERT INTO public.stages (name, order_index, color, pipeline_id, description) 
SELECT 
  stage_name, 
  stage_order, 
  stage_color, 
  p.id,
  stage_desc
FROM (
  VALUES 
    ('Identificado', 1, '#6B7280', 'Empresa identificada como objetivo potencial'),
    ('Investigando', 2, '#3B82F6', 'Investigación en profundidad de la empresa'),
    ('Contacto Planificado', 3, '#F59E0B', 'Preparación para el primer contacto'),
    ('Contactado', 4, '#EF4444', 'Primer contacto establecido'),
    ('En Conversación', 5, '#10B981', 'Conversaciones activas en curso'),
    ('En Pausa', 6, '#DC2626', 'Conversaciones pausadas temporalmente'),
    ('Convertido', 7, '#8B5CF6', 'Convertido en operación formal')
) AS stages(stage_name, stage_order, stage_color, stage_desc)
JOIN public.pipelines p ON p.name = 'Pipeline de Empresas Objetivo';

-- Insertar stages por defecto para el pipeline de leads
INSERT INTO public.stages (name, order_index, color, pipeline_id, description) 
SELECT 
  stage_name, 
  stage_order, 
  stage_color, 
  p.id,
  stage_desc
FROM (
  VALUES 
    ('Nuevo', 1, '#6B7280', 'Lead recién recibido'),
    ('Contactado', 2, '#3B82F6', 'Primer contacto realizado'),
    ('Calificado', 3, '#10B981', 'Lead calificado como oportunidad'),
    ('Descartado', 4, '#EF4444', 'Lead descartado por no cumplir criterios')
) AS stages(stage_name, stage_order, stage_color, stage_desc)
JOIN public.pipelines p ON p.name = 'Pipeline de Leads';
