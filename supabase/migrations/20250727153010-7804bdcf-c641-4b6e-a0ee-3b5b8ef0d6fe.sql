-- Crear enum para estado de tareas de leads
CREATE TYPE lead_task_status AS ENUM ('pendiente', 'en_curso', 'hecho');

-- Crear tabla lead_tasks
CREATE TABLE public.lead_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  vencimiento DATE,
  estado lead_task_status NOT NULL DEFAULT 'pendiente',
  asignado_a UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view lead tasks for leads they can access"
ON public.lead_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_tasks.lead_id 
    AND (
      leads.assigned_to_id = auth.uid() 
      OR leads.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  )
);

CREATE POLICY "Users can create lead tasks for accessible leads"
ON public.lead_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_tasks.lead_id 
    AND (
      leads.assigned_to_id = auth.uid() 
      OR leads.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  )
);

CREATE POLICY "Users can update lead tasks they created or are assigned to"
ON public.lead_tasks
FOR UPDATE
USING (
  asignado_a = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_tasks.lead_id 
    AND (
      leads.assigned_to_id = auth.uid() 
      OR leads.created_by = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can delete lead tasks they created or are assigned to"
ON public.lead_tasks
FOR DELETE
USING (
  asignado_a = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_tasks.lead_id 
    AND (
      leads.assigned_to_id = auth.uid() 
      OR leads.created_by = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Índices para performance
CREATE INDEX idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);
CREATE INDEX idx_lead_tasks_asignado_a ON public.lead_tasks(asignado_a);
CREATE INDEX idx_lead_tasks_estado ON public.lead_tasks(estado);
CREATE INDEX idx_lead_tasks_vencimiento ON public.lead_tasks(vencimiento);

-- Trigger para updated_at
CREATE TRIGGER update_lead_tasks_updated_at
BEFORE UPDATE ON public.lead_tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();