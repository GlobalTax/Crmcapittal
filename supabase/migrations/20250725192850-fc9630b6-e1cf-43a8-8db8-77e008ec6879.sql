-- 2.4 Tareas internas de valoración
-- Stores internal tasks for valoraciones with standardized fields and proper audit trail

CREATE TABLE IF NOT EXISTS public.valoracion_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valoracion_id uuid NOT NULL REFERENCES public.valoraciones(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  completed boolean NOT NULL DEFAULT false,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add table and column comments
COMMENT ON TABLE public.valoracion_tasks IS 'Internal tasks for valoraciones with standardized fields and audit trail';
COMMENT ON COLUMN public.valoracion_tasks.id IS 'Unique identifier for the task';
COMMENT ON COLUMN public.valoracion_tasks.valoracion_id IS 'Reference to the valoracion this task belongs to';
COMMENT ON COLUMN public.valoracion_tasks.title IS 'Task title or name';
COMMENT ON COLUMN public.valoracion_tasks.description IS 'Detailed description of the task';
COMMENT ON COLUMN public.valoracion_tasks.due_date IS 'When this task is due';
COMMENT ON COLUMN public.valoracion_tasks.priority IS 'Task priority: low, medium, high, urgent';
COMMENT ON COLUMN public.valoracion_tasks.completed IS 'Whether the task has been completed';
COMMENT ON COLUMN public.valoracion_tasks.assigned_to IS 'User assigned to this task';
COMMENT ON COLUMN public.valoracion_tasks.created_by IS 'User who created this task';
COMMENT ON COLUMN public.valoracion_tasks.completed_at IS 'When the task was completed';
COMMENT ON COLUMN public.valoracion_tasks.created_at IS 'When this task was created';
COMMENT ON COLUMN public.valoracion_tasks.updated_at IS 'When this task was last updated';

-- Enable Row Level Security
ALTER TABLE public.valoracion_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access valoracion tasks if they have access to the valoracion
CREATE POLICY "Users can view valoracion tasks for accessible valoraciones"
  ON public.valoracion_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_tasks.valoracion_id
      AND (
        v.assigned_to = auth.uid() OR
        v.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can create valoracion tasks for accessible valoraciones"
  ON public.valoracion_tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_tasks.valoracion_id
      AND (
        v.assigned_to = auth.uid() OR
        v.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can update valoracion tasks for accessible valoraciones"
  ON public.valoracion_tasks
  FOR UPDATE
  USING (
    (auth.uid() = created_by OR auth.uid() = assigned_to) AND
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_tasks.valoracion_id
      AND (
        v.assigned_to = auth.uid() OR
        v.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can delete valoracion tasks for accessible valoraciones"
  ON public.valoracion_tasks
  FOR DELETE
  USING (
    (auth.uid() = created_by OR 
     EXISTS (
       SELECT 1 FROM public.user_roles ur
       WHERE ur.user_id = auth.uid()
       AND ur.role IN ('admin', 'superadmin')
     )) AND
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_tasks.valoracion_id
      AND (
        v.assigned_to = auth.uid() OR
        v.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_valoracion_id ON public.valoracion_tasks(valoracion_id);
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_assigned_to ON public.valoracion_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_created_by ON public.valoracion_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_due_date ON public.valoracion_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_completed ON public.valoracion_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_valoracion_tasks_priority ON public.valoracion_tasks(priority);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_valoracion_tasks_updated_at
  BEFORE UPDATE ON public.valoracion_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic completed_at timestamp
CREATE OR REPLACE FUNCTION public.update_valoracion_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when task is marked as completed
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = now();
  -- Clear completed_at when task is marked as not completed
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_valoracion_task_completed_at
  BEFORE UPDATE ON public.valoracion_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_valoracion_task_completed_at();