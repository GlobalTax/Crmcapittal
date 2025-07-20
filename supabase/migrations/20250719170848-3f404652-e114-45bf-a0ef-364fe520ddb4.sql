
-- Crear tabla para notas de transacciones
CREATE TABLE public.transaction_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaccion_id uuid NOT NULL,
  note text NOT NULL,
  note_type text DEFAULT 'general'::text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Crear tabla para tareas de transacciones
CREATE TABLE public.transaction_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaccion_id uuid NOT NULL,
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

-- Crear tabla para personas asociadas a transacciones
CREATE TABLE public.transaction_people (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaccion_id uuid NOT NULL,
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
ALTER TABLE public.transaction_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_people ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transaction_notes
CREATE POLICY "Users can view transaction notes" ON public.transaction_notes
FOR SELECT USING (true);

CREATE POLICY "Users can create transaction notes" ON public.transaction_notes
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own transaction notes" ON public.transaction_notes
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own transaction notes" ON public.transaction_notes
FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para transaction_tasks
CREATE POLICY "Users can view transaction tasks" ON public.transaction_tasks
FOR SELECT USING (true);

CREATE POLICY "Users can create transaction tasks" ON public.transaction_tasks
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update transaction tasks" ON public.transaction_tasks
FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own transaction tasks" ON public.transaction_tasks
FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para transaction_people
CREATE POLICY "Users can view transaction people" ON public.transaction_people
FOR SELECT USING (true);

CREATE POLICY "Users can create transaction people" ON public.transaction_people
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update transaction people" ON public.transaction_people
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete transaction people" ON public.transaction_people
FOR DELETE USING (auth.uid() = created_by);

-- Trigger para actualizar updated_at en transaction_tasks
CREATE OR REPLACE FUNCTION update_transaction_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_tasks_updated_at
  BEFORE UPDATE ON public.transaction_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_tasks_updated_at();

-- Trigger para actualizar updated_at en transaction_people
CREATE OR REPLACE FUNCTION update_transaction_people_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_people_updated_at
  BEFORE UPDATE ON public.transaction_people
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_people_updated_at();
