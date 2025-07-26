-- WORKFLOW & AUTOMATIZACIÓN para Reconversiones

-- 1. Función para matching de targets
CREATE OR REPLACE FUNCTION public.match_targets_for_reconversion(reconversion_id UUID)
RETURNS TABLE(
  target_count INTEGER,
  matched_companies JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reconversion_record RECORD;
  match_count INTEGER;
  matches JSONB;
BEGIN
  -- Obtener datos de la reconversión
  SELECT * INTO reconversion_record
  FROM public.reconversiones_new
  WHERE id = reconversion_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reconversión no encontrada';
  END IF;
  
  -- Buscar empresas que coincidan con los criterios
  WITH matched_targets AS (
    SELECT 
      c.id,
      c.name,
      c.industry,
      c.annual_revenue,
      c.city,
      c.company_size
    FROM public.companies c
    WHERE 
      -- Coincidencia por sectores objetivo
      (reconversion_record.target_sectors IS NULL OR 
       reconversion_record.target_sectors && ARRAY[c.industry])
      AND
      -- Coincidencia por ubicación geográfica
      (reconversion_record.geographic_preferences IS NULL OR 
       reconversion_record.geographic_preferences && ARRAY[c.city])
      AND
      -- Rango de facturación
      (reconversion_record.revenue_range_min IS NULL OR 
       c.annual_revenue >= reconversion_record.revenue_range_min)
      AND
      (reconversion_record.revenue_range_max IS NULL OR 
       c.annual_revenue <= reconversion_record.revenue_range_max)
      AND
      -- Excluir la propia empresa si coincide
      c.name != reconversion_record.company_name
    LIMIT 50
  )
  SELECT 
    COUNT(*)::INTEGER,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', mt.id,
        'name', mt.name,
        'industry', mt.industry,
        'revenue', mt.annual_revenue,
        'location', mt.city,
        'size', mt.company_size
      )
    ), '[]'::jsonb)
  INTO match_count, matches
  FROM matched_targets mt;
  
  -- Actualizar la reconversión con los resultados
  UPDATE public.reconversiones_new 
  SET 
    matched_targets_count = match_count,
    matched_targets_data = matches,
    last_matching_at = now(),
    updated_at = now()
  WHERE id = reconversion_id;
  
  RETURN QUERY SELECT match_count, matches;
END;
$$;

-- 2. Función para actualizar subfase con audit log
CREATE OR REPLACE FUNCTION public.update_reconversion_subfase(
  reconversion_id UUID,
  new_subfase reconversion_subfase,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_subfase reconversion_subfase;
BEGIN
  -- Obtener subfase actual
  SELECT subfase INTO old_subfase
  FROM public.reconversiones_new
  WHERE id = reconversion_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar subfase
  UPDATE public.reconversiones_new 
  SET 
    subfase = new_subfase,
    last_activity_at = now(),
    updated_at = now()
  WHERE id = reconversion_id;
  
  -- Registrar en audit log
  PERFORM public.log_reconversion_audit(
    reconversion_id,
    'subfase_change',
    'Cambio de subfase: ' || old_subfase::text || ' → ' || new_subfase::text,
    jsonb_build_object('old_subfase', old_subfase),
    jsonb_build_object('new_subfase', new_subfase),
    'info',
    jsonb_build_object('automated', false, 'user_id', user_id)
  );
  
  -- Ejecutar acciones específicas por subfase
  CASE new_subfase
    WHEN 'nda' THEN
      -- Crear tarea para envío de NDA
      INSERT INTO public.reconversion_tasks (
        reconversion_id,
        title,
        description,
        task_type,
        priority,
        due_date,
        created_by
      ) VALUES (
        reconversion_id,
        'Enviar NDA',
        'Enviar acuerdo de confidencialidad a la contraparte',
        'document',
        'alta',
        now() + interval '2 days',
        user_id
      );
      
    WHEN 'loi' THEN
      -- Crear registro de aprobación LOI
      INSERT INTO public.reconversion_approvals (
        reconversion_id,
        approval_type,
        approval_stage,
        status,
        created_by
      ) VALUES (
        reconversion_id,
        'loi',
        'loi',
        'pending',
        user_id
      );
      
    WHEN 'signing' THEN
      -- Crear tarea para preparar documentos finales
      INSERT INTO public.reconversion_tasks (
        reconversion_id,
        title,
        description,
        task_type,
        priority,
        due_date,
        created_by
      ) VALUES (
        reconversion_id,
        'Preparar documentos de cierre',
        'Preparar toda la documentación para el cierre de la transacción',
        'closing',
        'critica',
        now() + interval '5 days',
        user_id
      );
      
    ELSE
      -- No acción específica para otras subfases
      NULL;
  END CASE;
  
  RETURN TRUE;
END;
$$;

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