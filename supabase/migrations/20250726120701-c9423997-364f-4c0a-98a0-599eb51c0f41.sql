-- Completar funciones de workflow - Parte 3

-- 3. Función para crear reconversión con workflow inicial
CREATE OR REPLACE FUNCTION public.create_reconversion_with_workflow(
  reconversion_data JSONB,
  user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_reconversion_id UUID;
BEGIN
  -- Crear reconversión
  INSERT INTO public.reconversiones_new (
    company_name,
    contact_name,
    buyer_contact_email,
    target_sectors,
    geographic_preferences,
    investment_capacity_min,
    investment_capacity_max,
    revenue_range_min,
    revenue_range_max,
    ebitda_range_min,
    ebitda_range_max,
    original_rejection_reason,
    reconversion_approach,
    notes,
    estado,
    subfase,
    prioridad,
    created_by,
    assigned_to,
    pipeline_owner_id
  ) VALUES (
    reconversion_data->>'company_name',
    reconversion_data->>'contact_name',
    reconversion_data->>'buyer_contact_email',
    CASE WHEN reconversion_data->'target_sectors' IS NOT NULL 
         THEN ARRAY(SELECT jsonb_array_elements_text(reconversion_data->'target_sectors'))
         ELSE NULL END,
    CASE WHEN reconversion_data->'geographic_preferences' IS NOT NULL 
         THEN ARRAY(SELECT jsonb_array_elements_text(reconversion_data->'geographic_preferences'))
         ELSE NULL END,
    (reconversion_data->>'investment_capacity_min')::NUMERIC,
    (reconversion_data->>'investment_capacity_max')::NUMERIC,
    (reconversion_data->>'revenue_range_min')::NUMERIC,
    (reconversion_data->>'revenue_range_max')::NUMERIC,
    (reconversion_data->>'ebitda_range_min')::NUMERIC,
    (reconversion_data->>'ebitda_range_max')::NUMERIC,
    reconversion_data->>'original_rejection_reason',
    reconversion_data->>'reconversion_approach',
    reconversion_data->>'notes',
    'activa'::reconversion_estado,
    'prospecting'::reconversion_subfase,
    'media'::reconversion_prioridad,
    user_id,
    (reconversion_data->>'assigned_to')::UUID,
    user_id
  ) RETURNING id INTO new_reconversion_id;
  
  -- Crear tarea inicial "Completar preferencias"
  INSERT INTO public.reconversion_tasks (
    reconversion_id,
    title,
    description,
    task_type,
    priority,
    due_date,
    assigned_to,
    created_by
  ) VALUES (
    new_reconversion_id,
    'Completar preferencias',
    'Completar y validar todas las preferencias del buyer para optimizar el matching',
    'validation',
    'alta',
    now() + interval '3 days',
    COALESCE((reconversion_data->>'assigned_to')::UUID, user_id),
    user_id
  );
  
  RETURN new_reconversion_id;
END;
$$;

-- 4. Función para procesar estado cerrada
CREATE OR REPLACE FUNCTION public.process_reconversion_closure(
  reconversion_id UUID,
  closure_data JSONB,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Actualizar reconversión a cerrada
  UPDATE public.reconversiones_new 
  SET 
    estado = 'cerrada'::reconversion_estado,
    fecha_cierre = now(),
    enterprise_value = (closure_data->>'enterprise_value')::NUMERIC,
    equity_percentage = (closure_data->>'equity_percentage')::NUMERIC,
    updated_at = now()
  WHERE id = reconversion_id;
  
  -- Crear tarea para registrar honorarios
  INSERT INTO public.reconversion_tasks (
    reconversion_id,
    title,
    description,
    task_type,
    priority,
    due_date,
    assigned_to,
    created_by
  ) VALUES (
    reconversion_id,
    'Registrar honorarios',
    'Calcular y registrar los honorarios correspondientes a la transacción cerrada',
    'finance',
    'critica',
    now() + interval '7 days',
    user_id,
    user_id
  );
  
  -- Enviar notificación de cierre exitoso
  PERFORM public.send_reconversion_notification(
    reconversion_id,
    'closure_success',
    user_id,
    'Reconversión cerrada exitosamente',
    'La reconversión ha sido cerrada. Por favor, procede a registrar los honorarios correspondientes.',
    jsonb_build_object(
      'enterprise_value', closure_data->>'enterprise_value',
      'equity_percentage', closure_data->>'equity_percentage'
    )
  );
  
  RETURN TRUE;
END;
$$;

-- 5. Trigger para ejecutar matching automático
CREATE OR REPLACE FUNCTION public.handle_reconversion_matching()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  match_result RECORD;
BEGIN
  -- Si el estado cambió a matching
  IF NEW.estado = 'matching'::reconversion_estado AND 
     (OLD.estado IS NULL OR OLD.estado != 'matching'::reconversion_estado) THEN
    
    -- Ejecutar matching
    SELECT * INTO match_result
    FROM public.match_targets_for_reconversion(NEW.id);
    
    -- Crear tarea o notificación según resultados
    IF match_result.target_count > 0 THEN
      INSERT INTO public.reconversion_tasks (
        reconversion_id,
        title,
        description,
        task_type,
        priority,
        due_date,
        assigned_to,
        created_by
      ) VALUES (
        NEW.id,
        'Revisar coincidencias',
        'Se encontraron ' || match_result.target_count || ' posibles targets. Revisar y contactar.',
        'review',
        'alta',
        now() + interval '2 days',
        NEW.assigned_to,
        NEW.created_by
      );
    ELSE
      -- Sin matches: bajar prioridad y notificar
      UPDATE public.reconversiones_new 
      SET prioridad = 'baja'::reconversion_prioridad
      WHERE id = NEW.id;
      
      PERFORM public.send_reconversion_notification(
        NEW.id,
        'no_matches',
        NEW.assigned_to,
        'Sin coincidencias encontradas',
        'No se encontraron targets que coincidan con los criterios. Considera ampliar los parámetros de búsqueda.',
        jsonb_build_object('search_criteria', jsonb_build_object(
          'sectors', NEW.target_sectors,
          'locations', NEW.geographic_preferences,
          'revenue_min', NEW.revenue_range_min,
          'revenue_max', NEW.revenue_range_max
        ))
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_reconversion_matching ON public.reconversiones_new;
CREATE TRIGGER trigger_reconversion_matching
  AFTER UPDATE ON public.reconversiones_new
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reconversion_matching();

-- Crear tabla para documentos de reconversión
CREATE TABLE IF NOT EXISTS public.reconversion_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones_new(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_to TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para reconversion_documents
ALTER TABLE public.reconversion_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reconversion documents they have access to" 
  ON public.reconversion_documents FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reconversiones_new r
      WHERE r.id = reconversion_documents.reconversion_id
      AND (
        r.created_by = auth.uid() OR 
        r.assigned_to = auth.uid() OR 
        r.pipeline_owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can create reconversion documents" 
  ON public.reconversion_documents FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.reconversiones_new r
      WHERE r.id = reconversion_documents.reconversion_id
      AND (
        r.created_by = auth.uid() OR 
        r.assigned_to = auth.uid() OR 
        r.pipeline_owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their reconversion documents" 
  ON public.reconversion_documents FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );