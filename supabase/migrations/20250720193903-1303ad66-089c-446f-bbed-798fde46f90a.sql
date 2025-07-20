
-- Verificar que la tabla pipeline_stages existe y tiene los datos correctos
-- Si no existe, la creamos con los datos por defecto
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar etapas por defecto si no existen
INSERT INTO public.pipeline_stages (name, stage_order, color) 
SELECT * FROM (VALUES
  ('Pipeline', 1, '#6B7280'),
  ('Cualificado', 2, '#3B82F6'),
  ('Propuesta', 3, '#F59E0B'),
  ('Negociación', 4, '#EF4444'),
  ('Ganado', 5, '#10B981'),
  ('Perdido', 6, '#6B7280')
) AS v(name, stage_order, color)
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_stages);

-- Verificar que la tabla leads tiene todas las columnas necesarias
-- Agregar columnas faltantes si no existen
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_close_date DATE,
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_stage_id UUID REFERENCES public.pipeline_stages(id),
ADD COLUMN IF NOT EXISTS is_followed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity_type TEXT,
ADD COLUMN IF NOT EXISTS next_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS won_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lost_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Asegurar que existen las tablas de actividades, notas y tareas
-- (Ya fueron creadas en migraciones anteriores, pero verificamos)
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER,
  outcome TEXT,
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activity_data JSONB DEFAULT '{}'::jsonb,
  points_awarded INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pipeline_stages (solo lectura)
DROP POLICY IF EXISTS "Users can view pipeline stages" ON public.pipeline_stages;
CREATE POLICY "Users can view pipeline stages" ON public.pipeline_stages
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas RLS para lead_activities
DROP POLICY IF EXISTS "Users can view lead activities" ON public.lead_activities;
CREATE POLICY "Users can view lead activities" ON public.lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create lead activities" ON public.lead_activities;
CREATE POLICY "Users can create lead activities" ON public.lead_activities
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

-- Políticas similares para lead_notes y lead_tasks
DROP POLICY IF EXISTS "Users can view lead notes" ON public.lead_notes;
CREATE POLICY "Users can view lead notes" ON public.lead_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create lead notes" ON public.lead_notes;
CREATE POLICY "Users can create lead notes" ON public.lead_notes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view lead tasks" ON public.lead_tasks;
CREATE POLICY "Users can view lead tasks" ON public.lead_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    ) OR auth.uid() = assigned_to
  );

DROP POLICY IF EXISTS "Users can create lead tasks" ON public.lead_tasks;
CREATE POLICY "Users can create lead tasks" ON public.lead_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );
