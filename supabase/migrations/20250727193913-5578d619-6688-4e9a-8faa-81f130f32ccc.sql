-- Función para recalcular el score de un lead
CREATE OR REPLACE FUNCTION public.fn_recalcular_score_lead(p_lead_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rule_record RECORD;
  lead_record RECORD;
  total_score INTEGER := 0;
  new_prob_conversion NUMERIC;
  conditions_met BOOLEAN;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
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
      WHEN 'EMAIL_OPENED' THEN
        -- Verificar si existe interacción de email abierto
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'email'
          AND li.detalle ILIKE '%abierto%'
        ) INTO conditions_met;
        
      WHEN 'EMAIL_CLICKED' THEN
        -- Verificar si existe interacción de email con click
        SELECT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = p_lead_id 
          AND li.tipo = 'email'
          AND li.detalle ILIKE '%click%'
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
        
      WHEN 'FORM_SUBMITTED' THEN
        -- Verificar datos del lead según criterios en condicion
        conditions_met := true;
        
        -- Evaluar criterios adicionales si existen
        IF rule_record.condicion ? 'lead_source' THEN
          conditions_met := conditions_met AND (lead_record.source = rule_record.condicion->>'lead_source');
        END IF;
        
        IF rule_record.condicion ? 'service_type' THEN
          conditions_met := conditions_met AND (lead_record.service_type = rule_record.condicion->>'service_type');
        END IF;
        
        IF rule_record.condicion ? 'min_budget' THEN
          conditions_met := conditions_met AND (
            lead_record.budget_range IS NOT NULL AND 
            (lead_record.budget_range::INTEGER >= (rule_record.condicion->>'min_budget')::INTEGER)
          );
        END IF;
        
      WHEN 'WEBSITE_VISIT' THEN
        -- Verificar actividad de visita web (simulado)
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
  
  -- Calcular probabilidad de conversión (mínimo 1, score/100)
  new_prob_conversion := LEAST(1.0, total_score / 100.0);
  
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
$$;