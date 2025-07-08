
-- Crear tabla para actividades de targets
CREATE TABLE public.mandate_target_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id uuid NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  activity_data jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para enriquecimientos de targets con eInforma
CREATE TABLE public.mandate_target_enrichments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id uuid NOT NULL,
  enrichment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'einforma',
  confidence_score numeric,
  enriched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para seguimientos y recordatorios
CREATE TABLE public.mandate_target_followups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id uuid NOT NULL,
  followup_type text NOT NULL DEFAULT 'reminder',
  title text NOT NULL,
  description text,
  scheduled_date timestamp with time zone NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  priority text DEFAULT 'medium',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.mandate_target_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_target_enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_target_followups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mandate_target_activities
CREATE POLICY "Users can view target activities" ON public.mandate_target_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_activities.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

CREATE POLICY "Users can create target activities" ON public.mandate_target_activities
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_activities.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

-- Políticas RLS para mandate_target_enrichments
CREATE POLICY "Users can view target enrichments" ON public.mandate_target_enrichments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_enrichments.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

CREATE POLICY "Users can manage target enrichments" ON public.mandate_target_enrichments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_enrichments.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

-- Políticas RLS para mandate_target_followups
CREATE POLICY "Users can view target followups" ON public.mandate_target_followups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_followups.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

CREATE POLICY "Users can create target followups" ON public.mandate_target_followups
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_followups.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

CREATE POLICY "Users can update their target followups" ON public.mandate_target_followups
  FOR UPDATE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.mandate_targets mt
      JOIN public.buying_mandates bm ON mt.mandate_id = bm.id
      WHERE mt.id = mandate_target_followups.target_id
      AND (bm.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ))
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_mandate_target_activities_updated_at
  BEFORE UPDATE ON public.mandate_target_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_target_enrichments_updated_at
  BEFORE UPDATE ON public.mandate_target_enrichments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_target_followups_updated_at
  BEFORE UPDATE ON public.mandate_target_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para registrar actividades automáticamente
CREATE OR REPLACE FUNCTION public.log_mandate_target_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.mandate_target_activities (
      target_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Estado cambiado',
      'El estado del target ha cambiado de ' || OLD.status || ' a ' || NEW.status,
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'automated', true
      ),
      auth.uid()
    );
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.contacted = true AND OLD.contacted = false THEN
    INSERT INTO public.mandate_target_activities (
      target_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'contact_made',
      'Primer contacto realizado',
      'Se ha establecido el primer contacto con el target',
      jsonb_build_object(
        'contact_method', NEW.contact_method,
        'contact_date', NEW.contact_date,
        'automated', true
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear trigger para actividades automáticas
CREATE TRIGGER log_mandate_target_activity_trigger
  AFTER UPDATE ON public.mandate_targets
  FOR EACH ROW EXECUTE FUNCTION public.log_mandate_target_activity();
