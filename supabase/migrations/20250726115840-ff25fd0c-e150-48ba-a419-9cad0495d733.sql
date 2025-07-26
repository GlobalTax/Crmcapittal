-- WORKFLOW & AUTOMATIZACIÓN para Reconversiones - Parte 2

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