-- Continue fixing remaining database security issues

-- Fix remaining functions without proper search_path
CREATE OR REPLACE FUNCTION public.process_inactive_leads()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record RECORD;
  task_count INTEGER := 0;
  score_updates INTEGER := 0;
  result jsonb;
BEGIN
  -- Find inactive leads in target stages
  FOR lead_record IN 
    SELECT l.id, l.name, l.email, l.assigned_to_id, l.pipeline_stage_id, l.last_contacted
    FROM leads l
    JOIN pipeline_stages ps ON l.pipeline_stage_id = ps.id
    WHERE l.last_contacted < NOW() - INTERVAL '30 days'
    AND ps.name IN ('Pipeline', 'Cualificado', 'Propuesta')
    AND l.status NOT IN ('CONVERTED', 'DISQUALIFIED')
  LOOP
    -- Create reactivation task
    INSERT INTO lead_tasks (
      lead_id,
      title,
      description,
      priority,
      status,
      assigned_to,
      due_date,
      created_by
    ) VALUES (
      lead_record.id,
      'Reactivar lead',
      'Lead inactivo por más de 30 días. Requiere reactivación urgente.',
      'high',
      'pending',
      COALESCE(lead_record.assigned_to_id, (
        SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1
      )),
      NOW() + INTERVAL '3 days',
      (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1)
    );
    
    task_count := task_count + 1;
    
    -- Apply inactivity penalty using existing scoring system
    PERFORM public.update_lead_score(lead_record.id, -20);
    
    -- Log the score change
    PERFORM public.log_lead_score_change(
      lead_record.id,
      'Penalización por Inactividad',
      -20,
      COALESCE((SELECT lead_score FROM lead_nurturing WHERE lead_id = lead_record.id), 0) - 20
    );
    
    score_updates := score_updates + 1;
    
    -- Update last_activity_date in lead_nurturing
    INSERT INTO lead_nurturing (lead_id, stage, last_activity_date, updated_at)
    VALUES (lead_record.id, 'NURTURING', NOW(), NOW())
    ON CONFLICT (lead_id) 
    DO UPDATE SET 
      last_activity_date = NOW(),
      updated_at = NOW();
    
  END LOOP;
  
  -- Log the operation
  RAISE NOTICE 'Processed % inactive leads, created % tasks, applied % score penalties', 
    score_updates, task_count, score_updates;
  
  result := jsonb_build_object(
    'processed_leads', score_updates,
    'created_tasks', task_count,
    'score_penalties', score_updates,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$function$;

-- Fix fn_recalcular_score_lead function
CREATE OR REPLACE FUNCTION public.fn_recalcular_score_lead(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rule_record RECORD;
  lead_record RECORD;
  total_score INTEGER := 0;
  new_prob_conversion NUMERIC;
  conditions_met BOOLEAN;
  days_since_last_activity INTEGER;
  last_activity_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  -- Obtener fecha de última actividad
  SELECT MAX(fecha) INTO last_activity_date
  FROM lead_interactions 
  WHERE lead_id = p_lead_id;
  
  -- Calcular días desde última actividad
  IF last_activity_date IS NOT NULL THEN
    days_since_last_activity := EXTRACT(DAYS FROM NOW() - last_activity_date);
  ELSE
    days_since_last_activity := EXTRACT(DAYS FROM NOW() - lead_record.created_at);
  END IF;
  
  -- Iterar sobre todas las reglas activas de scoring
  FOR rule_record IN 
    SELECT * FROM lead_scoring_rules 
    WHERE activo = true 
    ORDER BY created_at
  LOOP
    conditions_met := false;
    
    -- Evaluar condiciones según el tipo de actividad
    CASE rule_record.condicion->>'activity_type'
      
      WHEN 'BUDGET_QUALIFICATION' THEN
        -- Verificar presupuesto del lead
        IF lead_record.budget_range IS NOT NULL THEN
          BEGIN
            -- Intentar convertir budget_range a número y comparar
            IF (lead_record.budget_range::INTEGER >= (rule_record.condicion->'criteria'->>'min_budget')::INTEGER) THEN
              conditions_met := true;
            END IF;
          EXCEPTION
            WHEN others THEN
              -- Si no se puede convertir, verificar si contiene "100k" o similar
              IF lead_record.budget_range ILIKE '%100%k%' OR 
                 lead_record.budget_range ILIKE '%más%' OR
                 lead_record.budget_range ILIKE '%alto%' THEN
                conditions_met := true;
              END IF;
          END;
        END IF;
        
      WHEN 'SECTOR_QUALIFICATION' THEN
        -- Verificar si el sector del lead está en la lista
        IF lead_record.sector_id IS NOT NULL THEN
          -- Buscar sector en companies relacionadas o en el campo sector directo
          SELECT EXISTS (
            SELECT 1 FROM companies c 
            WHERE c.id = lead_record.company_id 
            AND c.industry = ANY(ARRAY(SELECT jsonb_array_elements_text(rule_record.condicion->'criteria'->'sectors')))
          ) INTO conditions_met;
          
          -- También verificar en otros campos del lead que puedan contener sector
          IF NOT conditions_met AND lead_record.service_type IS NOT NULL THEN
            IF lead_record.service_type ILIKE '%tech%' OR lead_record.service_type ILIKE '%food%' THEN
              conditions_met := true;
            END IF;
          END IF;
        END IF;
        
      WHEN 'SOURCE_QUALIFICATION' THEN
        -- Verificar si el lead procede de referral
        IF lead_record.source = 'REFERRAL' OR lead_record.origin = 'REFERRAL' THEN
          conditions_met := true;
        END IF;
        
      WHEN 'EMAIL_OPENED' THEN
        -- Verificar si existe interacción de email abierto
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'email'
          AND li.detalle ILIKE '%abierto%'
        ) INTO conditions_met;
        
      WHEN 'EMAIL_CLICKED' THEN
        -- Verificar si existe interacción de email con click o respuesta
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'email'
          AND (li.detalle ILIKE '%click%' OR li.detalle ILIKE '%respuesta%' OR li.detalle ILIKE '%respondido%')
        ) INTO conditions_met;
        
      WHEN 'CALL_MADE' THEN
        -- Verificar si existe interacción de llamada
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'llamada'
        ) INTO conditions_met;
        
      WHEN 'MEETING_SCHEDULED' THEN
        -- Verificar si existe interacción de reunión
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'reunion'
        ) INTO conditions_met;
        
      WHEN 'INACTIVITY_PENALTY' THEN
        -- Verificar si han pasado los días sin actividad
        IF days_since_last_activity >= (rule_record.condicion->'criteria'->>'days_inactive')::INTEGER THEN
          conditions_met := true;
        END IF;
        
      WHEN 'FORM_SUBMITTED' THEN
        -- Verificar datos del lead según criterios en condicion
        conditions_met := true;
        
        -- Evaluar criterios adicionales si existen
        IF rule_record.condicion ? 'criteria' THEN
          IF rule_record.condicion->'criteria' ? 'lead_source' THEN
            conditions_met := conditions_met AND (lead_record.source = rule_record.condicion->'criteria'->>'lead_source');
          END IF;
          
          IF rule_record.condicion->'criteria' ? 'service_type' THEN
            conditions_met := conditions_met AND (lead_record.service_type = rule_record.condicion->'criteria'->>'service_type');
          END IF;
        END IF;
        
      WHEN 'WEBSITE_VISIT' THEN
        -- Verificar actividad de visita web
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'nota'
          AND li.detalle ILIKE '%web%'
        ) INTO conditions_met;
        
      ELSE
        -- Para otros tipos, asumir que se cumple si hay alguna interacción
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id
        ) INTO conditions_met;
    END CASE;
    
    -- Si se cumplen las condiciones, sumar puntos
    IF conditions_met THEN
      total_score := total_score + rule_record.valor;
      
      -- Insertar log de score
      INSERT INTO lead_score_logs (lead_id, regla, delta, total)
      VALUES (p_lead_id, rule_record.nombre, rule_record.valor, total_score);
    END IF;
  END LOOP;
  
  -- Calcular probabilidad de conversión (mínimo 0, máximo 1, score/100)
  new_prob_conversion := GREATEST(0.0, LEAST(1.0, total_score / 100.0));
  
  -- Actualizar lead con nuevo score y probabilidad
  UPDATE leads 
  SET 
    score = total_score,
    prob_conversion = new_prob_conversion,
    updated_at = now()
  WHERE id = p_lead_id;
  
  -- Log de la operación
  RAISE NOTICE 'Score recalculado para lead %: % puntos, probabilidad: %', 
    p_lead_id, total_score, new_prob_conversion;
    
END;
$function$;