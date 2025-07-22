
-- Crear tabla reconversiones si no existe
CREATE TABLE IF NOT EXISTS public.reconversiones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  rejection_reason TEXT,
  target_sectors TEXT[],
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'pausada', 'completada', 'cerrada')),
  notes TEXT,
  paused_at TIMESTAMP WITH TIME ZONE,
  paused_reason TEXT,
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_reason TEXT,
  final_outcome TEXT,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla reconversion_candidates si no existe
CREATE TABLE IF NOT EXISTS public.reconversion_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones(id) ON DELETE CASCADE,
  company_id UUID,
  company_name TEXT NOT NULL,
  company_sector TEXT,
  company_location TEXT,
  company_revenue NUMERIC,
  company_ebitda NUMERIC,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_status TEXT NOT NULL DEFAULT 'pendiente' CHECK (contact_status IN ('pendiente', 'contactado', 'interesado', 'no_interesado', 'seguimiento')),
  contact_date TIMESTAMP WITH TIME ZONE,
  contact_method TEXT,
  contact_notes TEXT,
  match_score NUMERIC,
  match_criteria JSONB,
  created_by UUID,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla reconversion_history si no existe
CREATE TABLE IF NOT EXISTS public.reconversion_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_description TEXT,
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en las tablas
ALTER TABLE public.reconversiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reconversiones
CREATE POLICY "Users can view their own reconversiones" ON public.reconversiones
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = assigned_to OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users can create reconversiones" ON public.reconversiones
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own reconversiones" ON public.reconversiones
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Admin users can delete reconversiones" ON public.reconversiones
  FOR DELETE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Políticas RLS para candidatos
CREATE POLICY "Users can view reconversion candidates" ON public.reconversion_candidates
  FOR SELECT USING (EXISTS (SELECT 1 FROM reconversiones WHERE id = reconversion_candidates.reconversion_id AND 
    (created_by = auth.uid() OR assigned_to = auth.uid() OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')))));

CREATE POLICY "Users can create reconversion candidates" ON public.reconversion_candidates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update reconversion candidates" ON public.reconversion_candidates
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users can delete reconversion candidates" ON public.reconversion_candidates
  FOR DELETE USING (auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Políticas RLS para historial
CREATE POLICY "Users can view reconversion history" ON public.reconversion_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM reconversiones WHERE id = reconversion_history.reconversion_id AND 
    (created_by = auth.uid() OR assigned_to = auth.uid() OR 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')))));

CREATE POLICY "Users can create reconversion history" ON public.reconversion_history
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_reconversion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reconversiones_updated_at_trigger
  BEFORE UPDATE ON public.reconversiones
  FOR EACH ROW EXECUTE FUNCTION update_reconversion_updated_at();

CREATE TRIGGER reconversion_candidates_updated_at_trigger
  BEFORE UPDATE ON public.reconversion_candidates
  FOR EACH ROW EXECUTE FUNCTION update_reconversion_updated_at();

-- Trigger para logging automático de actividad
CREATE OR REPLACE FUNCTION log_reconversion_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.reconversion_history (
      reconversion_id,
      action_type,
      action_title,
      action_description,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      'created',
      'Reconversión creada',
      'Se ha creado una nueva reconversión para ' || NEW.company_name,
      jsonb_build_object(
        'company_name', NEW.company_name,
        'contact_name', NEW.contact_name,
        'status', NEW.status
      ),
      NEW.created_by
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.reconversion_history (
      reconversion_id,
      action_type,
      action_title,
      action_description,
      previous_value,
      new_value,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Estado cambiado',
      'El estado de la reconversión ha cambiado de ' || OLD.status || ' a ' || NEW.status,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'paused_reason', NEW.paused_reason,
        'closed_reason', NEW.closed_reason,
        'final_outcome', NEW.final_outcome
      ),
      auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reconversiones_activity_trigger
  AFTER INSERT OR UPDATE ON public.reconversiones
  FOR EACH ROW EXECUTE FUNCTION log_reconversion_activity();
