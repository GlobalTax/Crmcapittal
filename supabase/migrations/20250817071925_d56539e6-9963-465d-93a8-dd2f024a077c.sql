-- Crear tabla para acciones de etapas
CREATE TABLE public.stage_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'automatic', 'manual', 'validation'
  action_name TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.stage_actions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view stage actions for accessible pipelines"
ON public.stage_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stages s
    JOIN public.pipelines p ON s.pipeline_id = p.id
    WHERE s.id = stage_actions.stage_id
  )
);

CREATE POLICY "Users can manage stage actions for their pipelines"
ON public.stage_actions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.stages s
    JOIN public.pipelines p ON s.pipeline_id = p.id
    WHERE s.id = stage_actions.stage_id
    AND (p.created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role))
  )
);

-- Índices para rendimiento
CREATE INDEX idx_stage_actions_stage_id ON public.stage_actions(stage_id);
CREATE INDEX idx_stage_actions_active ON public.stage_actions(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_stage_actions_updated_at
  BEFORE UPDATE ON public.stage_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Agregar campo para configuración avanzada en stages
ALTER TABLE public.stages 
ADD COLUMN IF NOT EXISTS stage_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS required_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '[]';

-- Crear tabla para templates de pipeline
CREATE TABLE public.pipeline_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  category TEXT DEFAULT 'custom',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para templates
ALTER TABLE public.pipeline_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates and their own"
ON public.pipeline_templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their own templates"
ON public.pipeline_templates FOR ALL
USING (created_by = auth.uid());