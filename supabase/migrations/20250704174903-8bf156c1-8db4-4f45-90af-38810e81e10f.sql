-- Tabla de tareas colaborativas asociadas a contactos
CREATE TABLE IF NOT EXISTS contact_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_contact_tasks_contact_id ON contact_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tasks_assigned_to ON contact_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_tasks_completed ON contact_tasks(completed);

-- Habilitar RLS
ALTER TABLE contact_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para colaboración
CREATE POLICY "Colaboradores pueden ver tareas de contactos" ON contact_tasks
  FOR SELECT USING (
    auth.uid() = created_by OR auth.uid() = assigned_to
  );

CREATE POLICY "Colaboradores pueden insertar tareas" ON contact_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Colaboradores pueden actualizar tareas" ON contact_tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR auth.uid() = assigned_to
  );

CREATE POLICY "Colaboradores pueden eliminar tareas" ON contact_tasks
  FOR DELETE USING (
    auth.uid() = created_by
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_contact_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_task_updated_at
  BEFORE UPDATE ON contact_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_task_updated_at();