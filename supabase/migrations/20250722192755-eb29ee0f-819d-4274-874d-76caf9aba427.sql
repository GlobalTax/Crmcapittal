
-- Crear tabla para candidatos de reconversión
CREATE TABLE public.reconversion_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id uuid NOT NULL REFERENCES public.reconversiones(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  company_sector text,
  company_location text,
  company_revenue numeric,
  company_ebitda numeric,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_status text NOT NULL DEFAULT 'pendiente',
  contact_date timestamp with time zone,
  contact_method text,
  contact_notes text,
  match_score numeric DEFAULT 0,
  match_criteria jsonb DEFAULT '{}',
  created_by uuid,
  assigned_to uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para historial de reconversiones
CREATE TABLE public.reconversion_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id uuid NOT NULL REFERENCES public.reconversiones(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_title text NOT NULL,
  action_description text,
  previous_value text,
  new_value text,
  metadata jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ampliar estados permitidos en reconversiones
ALTER TABLE public.reconversiones 
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS paused_reason text,
ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS closed_reason text,
ADD COLUMN IF NOT EXISTS final_outcome text;

-- Actualizar el CHECK constraint para incluir nuevos estados
ALTER TABLE public.reconversiones 
DROP CONSTRAINT IF EXISTS reconversiones_status_check;

ALTER TABLE public.reconversiones 
ADD CONSTRAINT reconversiones_status_check 
CHECK (status IN ('pendiente', 'en_progreso', 'pausada', 'completada', 'cerrada'));

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.reconversion_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reconversion_candidates
CREATE POLICY "Users can view reconversion candidates they created or admin"
ON public.reconversion_candidates FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.reconversiones r
    WHERE r.id = reconversion_candidates.reconversion_id 
    AND r.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create reconversion candidates"
ON public.reconversion_candidates FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.reconversiones r
    WHERE r.id = reconversion_candidates.reconversion_id 
    AND r.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update reconversion candidates they created"
ON public.reconversion_candidates FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.reconversiones r
    WHERE r.id = reconversion_candidates.reconversion_id 
    AND r.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete reconversion candidates"
ON public.reconversion_candidates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas RLS para reconversion_history
CREATE POLICY "Users can view reconversion history they created or admin"
ON public.reconversion_history FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.reconversiones r
    WHERE r.id = reconversion_history.reconversion_id 
    AND r.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create reconversion history"
ON public.reconversion_history FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- Triggers para updated_at
CREATE TRIGGER update_reconversion_candidates_updated_at
  BEFORE UPDATE ON public.reconversion_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para registrar historial automáticamente
CREATE OR REPLACE FUNCTION public.log_reconversion_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Registrar cambio de estado
    IF OLD.status != NEW.status THEN
      INSERT INTO public.reconversion_history (
        reconversion_id,
        action_type,
        action_title,
        action_description,
        previous_value,
        new_value,
        created_by
      ) VALUES (
        NEW.id,
        'status_change',
        'Estado cambiado',
        'El estado de la reconversión ha cambiado de ' || OLD.status || ' a ' || NEW.status,
        OLD.status,
        NEW.status,
        auth.uid()
      );
    END IF;
    
    -- Registrar pausa
    IF NEW.paused_at IS NOT NULL AND OLD.paused_at IS NULL THEN
      INSERT INTO public.reconversion_history (
        reconversion_id,
        action_type,
        action_title,
        action_description,
        new_value,
        metadata,
        created_by
      ) VALUES (
        NEW.id,
        'paused',
        'Reconversión pausada',
        COALESCE(NEW.paused_reason, 'Sin motivo especificado'),
        'pausada',
        jsonb_build_object('reason', NEW.paused_reason),
        auth.uid()
      );
    END IF;
    
    -- Registrar cierre
    IF NEW.closed_at IS NOT NULL AND OLD.closed_at IS NULL THEN
      INSERT INTO public.reconversion_history (
        reconversion_id,
        action_type,
        action_title,
        action_description,
        new_value,
        metadata,
        created_by
      ) VALUES (
        NEW.id,
        'closed',
        'Reconversión cerrada',
        COALESCE(NEW.closed_reason, 'Sin motivo especificado'),
        'cerrada',
        jsonb_build_object(
          'reason', NEW.closed_reason,
          'outcome', NEW.final_outcome
        ),
        auth.uid()
      );
    END IF;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.reconversion_history (
      reconversion_id,
      action_type,
      action_title,
      action_description,
      new_value,
      created_by
    ) VALUES (
      NEW.id,
      'created',
      'Reconversión creada',
      'Nueva reconversión creada para ' || NEW.company_name,
      NEW.status,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear trigger para historial automático
CREATE TRIGGER log_reconversion_history_trigger
  AFTER INSERT OR UPDATE ON public.reconversiones
  FOR EACH ROW EXECUTE FUNCTION public.log_reconversion_history();

-- Función para registrar actividad de candidatos
CREATE OR REPLACE FUNCTION public.log_reconversion_candidate_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
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
      NEW.reconversion_id,
      'candidate_added',
      'Candidato añadido',
      'Se ha añadido ' || NEW.company_name || ' como candidato',
      jsonb_build_object(
        'candidate_id', NEW.id,
        'company_name', NEW.company_name,
        'match_score', NEW.match_score
      ),
      NEW.created_by
    );
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.contact_status != NEW.contact_status THEN
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
      NEW.reconversion_id,
      'candidate_contact_updated',
      'Estado de contacto actualizado',
      'Estado de contacto de ' || NEW.company_name || ' cambiado de ' || OLD.contact_status || ' a ' || NEW.contact_status,
      OLD.contact_status,
      NEW.contact_status,
      jsonb_build_object(
        'candidate_id', NEW.id,
        'company_name', NEW.company_name,
        'contact_method', NEW.contact_method,
        'contact_notes', NEW.contact_notes
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear trigger para actividad de candidatos
CREATE TRIGGER log_reconversion_candidate_activity_trigger
  AFTER INSERT OR UPDATE ON public.reconversion_candidates
  FOR EACH ROW EXECUTE FUNCTION public.log_reconversion_candidate_activity();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_reconversion_candidates_reconversion_id ON public.reconversion_candidates(reconversion_id);
CREATE INDEX idx_reconversion_candidates_company_id ON public.reconversion_candidates(company_id);
CREATE INDEX idx_reconversion_candidates_contact_status ON public.reconversion_candidates(contact_status);
CREATE INDEX idx_reconversion_history_reconversion_id ON public.reconversion_history(reconversion_id);
CREATE INDEX idx_reconversion_history_action_type ON public.reconversion_history(action_type);
CREATE INDEX idx_reconversion_history_created_at ON public.reconversion_history(created_at);
