
-- Crear tablas específicas para notas, tareas y personas de mandatos
CREATE TABLE public.mandate_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id uuid NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  note text NOT NULL,
  note_type text DEFAULT 'general'::text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.mandate_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id uuid NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false NOT NULL,
  priority text DEFAULT 'medium'::text,
  due_date timestamp with time zone,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.mandate_people (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id uuid NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  role text NOT NULL,
  company text,
  is_primary boolean DEFAULT false NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.mandate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_people ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mandate_notes
CREATE POLICY "Users can view mandate notes" ON public.mandate_notes
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_notes.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate notes" ON public.mandate_notes
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own mandate notes" ON public.mandate_notes
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own mandate notes" ON public.mandate_notes
FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para mandate_tasks
CREATE POLICY "Users can view mandate tasks" ON public.mandate_tasks
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_tasks.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate tasks" ON public.mandate_tasks
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update mandate tasks" ON public.mandate_tasks
FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own mandate tasks" ON public.mandate_tasks
FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para mandate_people
CREATE POLICY "Users can view mandate people" ON public.mandate_people
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_people.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate people" ON public.mandate_people
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update mandate people" ON public.mandate_people
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete mandate people" ON public.mandate_people
FOR DELETE USING (auth.uid() = created_by);

-- Triggers para actualizar updated_at
CREATE TRIGGER mandate_tasks_updated_at
  BEFORE UPDATE ON public.mandate_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER mandate_people_updated_at
  BEFORE UPDATE ON public.mandate_people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
