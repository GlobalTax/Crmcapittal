-- Crear tabla stage_checklist_items para items de checklist configurables por etapa
CREATE TABLE public.stage_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla lead_checklist_progress para trackear progreso de checklist por lead
CREATE TABLE public.lead_checklist_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.stage_checklist_items(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, item_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_stage_checklist_items_stage_id ON public.stage_checklist_items(stage_id);
CREATE INDEX idx_stage_checklist_items_active_order ON public.stage_checklist_items(stage_id, is_active, order_index);
CREATE INDEX idx_lead_checklist_progress_lead_id ON public.lead_checklist_progress(lead_id);
CREATE INDEX idx_lead_checklist_progress_stage_id ON public.lead_checklist_progress(stage_id);
CREATE INDEX idx_lead_checklist_progress_item_id ON public.lead_checklist_progress(item_id);

-- Crear triggers para updated_at automático
CREATE TRIGGER update_stage_checklist_items_updated_at
  BEFORE UPDATE ON public.stage_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lead_checklist_progress_updated_at
  BEFORE UPDATE ON public.lead_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.stage_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_checklist_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies para stage_checklist_items
CREATE POLICY "Authenticated users can view checklist items"
  ON public.stage_checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert checklist items"
  ON public.stage_checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can update checklist items"
  ON public.stage_checklist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can delete checklist items"
  ON public.stage_checklist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies para lead_checklist_progress
CREATE POLICY "Users can view checklist progress for their leads"
  ON public.lead_checklist_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_checklist_progress.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create checklist progress for their leads"
  ON public.lead_checklist_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_checklist_progress.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can update checklist progress for their leads"
  ON public.lead_checklist_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_checklist_progress.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can delete checklist progress"
  ON public.lead_checklist_progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );