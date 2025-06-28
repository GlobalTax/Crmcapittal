
-- Crear tabla para entradas de tiempo
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  operation_id UUID NULL REFERENCES public.operations(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NULL,
  duration_minutes INTEGER NULL,
  description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'general',
  is_billable BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10,2) NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para objetivos de tiempo
CREATE TABLE public.time_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  target_hours DECIMAL(5,2) NOT NULL,
  activity_type TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para time_entries
CREATE POLICY "Users can view their own time entries" 
  ON public.time_entries 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries" 
  ON public.time_entries 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries" 
  ON public.time_entries 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para time_goals
CREATE POLICY "Users can view their own time goals" 
  ON public.time_goals 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time goals" 
  ON public.time_goals 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time goals" 
  ON public.time_goals 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time goals" 
  ON public.time_goals 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Crear índices para mejorar performance
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_contact_id ON public.time_entries(contact_id);
CREATE INDEX idx_time_entries_operation_id ON public.time_entries(operation_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX idx_time_goals_user_id ON public.time_goals(user_id);

-- Trigger para actualizar duration_minutes automáticamente
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entry_duration
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_duration();
