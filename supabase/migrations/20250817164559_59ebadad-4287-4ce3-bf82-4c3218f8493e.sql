-- Crear tabla para checklists de etapas
CREATE TABLE IF NOT EXISTS public.stage_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Crear tabla para acciones de etapas si no existe
CREATE TABLE IF NOT EXISTS public.stage_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('automatic', 'manual', 'validation')),
  action_name TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.stage_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_actions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para stage_checklists
CREATE POLICY "Users can view stage checklists" 
ON public.stage_checklists 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stage checklists" 
ON public.stage_checklists 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas RLS para stage_actions
CREATE POLICY "Users can view stage actions" 
ON public.stage_actions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stage actions" 
ON public.stage_actions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_stage_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_stage_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stage_checklists_updated_at
  BEFORE UPDATE ON public.stage_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stage_checklists_updated_at();

CREATE TRIGGER update_stage_actions_updated_at
  BEFORE UPDATE ON public.stage_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stage_actions_updated_at();