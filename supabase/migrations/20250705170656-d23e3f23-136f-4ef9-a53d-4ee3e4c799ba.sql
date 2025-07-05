-- Create pipelines table and stages table with proper RLS policies

-- Create pipeline type enum
CREATE TYPE pipeline_type AS ENUM ('OPERACION', 'PROYECTO', 'LEAD', 'TARGET_COMPANY', 'DEAL');

-- Create pipelines table
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type pipeline_type NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create stages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pipelines
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pipelines
CREATE POLICY "Authenticated users can view all active pipelines" 
  ON public.pipelines 
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create pipelines" 
  ON public.pipelines 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own pipelines or admins can update all" 
  ON public.pipelines 
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can delete their own pipelines or admins can delete all" 
  ON public.pipelines 
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pipelines for each type
INSERT INTO public.pipelines (name, type, description, created_by) VALUES
  ('Pipeline de Operaciones', 'OPERACION', 'Pipeline por defecto para operaciones', NULL),
  ('Pipeline de Proyectos', 'PROYECTO', 'Pipeline por defecto para proyectos', NULL),
  ('Pipeline de Leads', 'LEAD', 'Pipeline por defecto para leads', NULL),
  ('Pipeline de Empresas Objetivo', 'TARGET_COMPANY', 'Pipeline por defecto para empresas objetivo', NULL),
  ('Pipeline de Deals M&A', 'DEAL', 'Pipeline por defecto para deals M&A', NULL);

-- Insert default stages for each pipeline
WITH pipeline_stages AS (
  SELECT 
    p.id as pipeline_id,
    p.type,
    CASE 
      WHEN p.type = 'OPERACION' THEN 
        ARRAY[
          ('Análisis Inicial', '#EF4444', 1),
          ('Due Diligence', '#F97316', 2),
          ('Estructuración', '#EAB308', 3),
          ('Negociación', '#3B82F6', 4),
          ('Cierre', '#22C55E', 5)
        ]
      WHEN p.type = 'PROYECTO' THEN 
        ARRAY[
          ('Planificación', '#8B5CF6', 1),
          ('En Desarrollo', '#3B82F6', 2),
          ('Revisión', '#F59E0B', 3),
          ('Finalizado', '#10B981', 4)
        ]
      WHEN p.type = 'LEAD' THEN 
        ARRAY[
          ('Nuevo Lead', '#6B7280', 1),
          ('Contactado', '#3B82F6', 2),
          ('Cualificado', '#F59E0B', 3),
          ('Propuesta', '#8B5CF6', 4),
          ('Ganado', '#10B981', 5),
          ('Perdido', '#EF4444', 6)
        ]
      WHEN p.type = 'TARGET_COMPANY' THEN 
        ARRAY[
          ('Identificada', '#6B7280', 1),
          ('Investigación', '#3B82F6', 2),
          ('Contacto Inicial', '#F59E0B', 3),
          ('En Negociación', '#8B5CF6', 4),
          ('Cerrado', '#10B981', 5)
        ]
      WHEN p.type = 'DEAL' THEN 
        ARRAY[
          ('Prospecto', '#6B7280', 1),
          ('Análisis Inicial', '#3B82F6', 2),
          ('Due Diligence', '#F59E0B', 3),
          ('Estructuración', '#8B5CF6', 4),
          ('Negociación Final', '#F97316', 5),
          ('Cierre', '#10B981', 6)
        ]
    END as stages
  FROM public.pipelines p
)
INSERT INTO public.stages (name, color, order_index, pipeline_id)
SELECT 
  stage_info[1]::text as name,
  stage_info[2]::text as color,
  stage_info[3]::integer as order_index,
  ps.pipeline_id
FROM pipeline_stages ps,
LATERAL unnest(ps.stages) as stage_info;