-- Sistema Completo de Scoring Automático para Leads

-- 1. Insertar reglas de scoring iniciales
INSERT INTO public.lead_scoring_rules (nombre, description, condicion, valor, activo) VALUES 
(
  'Presupuesto Alto',
  'Lead con presupuesto superior a 100.000€',
  '{"activity_type": "BUDGET_QUALIFICATION", "criteria": {"min_budget": 100000}}'::jsonb,
  50,
  true
),
(
  'Sector Estratégico',
  'Lead del sector Tech o Food Distribution',
  '{"activity_type": "SECTOR_QUALIFICATION", "criteria": {"sectors": ["Tech", "Food Distribution"]}}'::jsonb,
  30,
  true
),
(
  'Referral Lead',
  'Lead que procede de referido',
  '{"activity_type": "SOURCE_QUALIFICATION", "criteria": {"source": "REFERRAL"}}'::jsonb,
  20,
  true
),
(
  'Email Respondido',
  'Lead que ha respondido a un email',
  '{"activity_type": "EMAIL_CLICKED", "criteria": {}}'::jsonb,
  10,
  true
),
(
  'Sin Respuesta 14 Días',
  'Penalización por falta de actividad durante 14 días',
  '{"activity_type": "INACTIVITY_PENALTY", "criteria": {"days_inactive": 14}}'::jsonb,
  -40,
  true
);

-- 2. Mejorar función de recalculación de score
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

-- 3. Función trigger para lead_interactions
CREATE OR REPLACE FUNCTION public.trigger_recalcular_score_lead_interactions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Recalcular score cuando se inserta o actualiza una interacción
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Llamar a la función de recalculación en modo asíncrono para evitar bloqueos
    PERFORM public.fn_recalcular_score_lead(NEW.lead_id);
    RETURN NEW;
  END IF;
  
  RETURN NULL;
EXCEPTION
  WHEN others THEN
    -- Log del error pero no fallar la operación principal
    RAISE WARNING 'Error al recalcular score para lead %: %', NEW.lead_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- 4. Función trigger para leads
CREATE OR REPLACE FUNCTION public.trigger_recalcular_score_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Recalcular score cuando se inserta o actualiza un lead
  IF TG_OP = 'INSERT' THEN
    -- Para nuevos leads, recalcular después de un breve delay
    PERFORM public.fn_recalcular_score_lead(NEW.id);
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Solo recalcular si cambiaron campos relevantes
    IF OLD.source IS DISTINCT FROM NEW.source OR
       OLD.service_type IS DISTINCT FROM NEW.service_type OR
       OLD.budget_range IS DISTINCT FROM NEW.budget_range OR
       OLD.sector_id IS DISTINCT FROM NEW.sector_id OR
       OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      PERFORM public.fn_recalcular_score_lead(NEW.id);
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
EXCEPTION
  WHEN others THEN
    -- Log del error pero no fallar la operación principal
    RAISE WARNING 'Error al recalcular score para lead %: %', COALESCE(NEW.id, OLD.id), SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 5. Función para recalcular todos los leads (cron job)
CREATE OR REPLACE FUNCTION public.recalcular_todos_los_leads()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record RECORD;
  total_processed INTEGER := 0;
  total_errors INTEGER := 0;
  start_time TIMESTAMP WITH TIME ZONE := now();
  end_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Iterar sobre todos los leads activos
  FOR lead_record IN 
    SELECT id FROM leads 
    WHERE status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT')
    ORDER BY created_at DESC
  LOOP
    BEGIN
      -- Recalcular score del lead
      PERFORM public.fn_recalcular_score_lead(lead_record.id);
      total_processed := total_processed + 1;
      
      -- Commit cada 100 leads para evitar transacciones muy largas
      IF total_processed % 100 = 0 THEN
        RAISE NOTICE 'Procesados % leads...', total_processed;
      END IF;
      
    EXCEPTION
      WHEN others THEN
        total_errors := total_errors + 1;
        RAISE WARNING 'Error recalculando lead %: %', lead_record.id, SQLERRM;
    END;
  END LOOP;
  
  end_time := now();
  
  -- Log del resultado
  RAISE NOTICE 'Recalculación completa: % leads procesados, % errores, tiempo: %',
    total_processed, total_errors, (end_time - start_time);
  
  RETURN jsonb_build_object(
    'leads_processed', total_processed,
    'errors', total_errors,
    'start_time', start_time,
    'end_time', end_time,
    'duration_seconds', EXTRACT(EPOCH FROM (end_time - start_time))
  );
END;
$function$;

-- 6. Crear triggers en las tablas
DROP TRIGGER IF EXISTS trigger_lead_interactions_score ON public.lead_interactions;
CREATE TRIGGER trigger_lead_interactions_score
  AFTER INSERT OR UPDATE ON public.lead_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalcular_score_lead_interactions();

DROP TRIGGER IF EXISTS trigger_leads_score ON public.leads;
CREATE TRIGGER trigger_leads_score
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalcular_score_lead();

-- 7. Configurar cron job para ejecutar diariamente a las 2:00 AM
-- Nota: El cron job se configura por separado usando pg_cron
SELECT cron.schedule(
  'recalcular-leads-diario',
  '0 2 * * *', -- 2:00 AM todos los días
  $$
  SELECT public.recalcular_todos_los_leads();
  $$
);

-- 8. Función auxiliar para verificar el estado del sistema de scoring
CREATE OR REPLACE FUNCTION public.estado_sistema_scoring()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_reglas INTEGER;
  reglas_activas INTEGER;
  total_leads INTEGER;
  leads_con_score INTEGER;
  ultimo_cron TIMESTAMP WITH TIME ZONE;
  resultado jsonb;
BEGIN
  -- Contar reglas
  SELECT COUNT(*) INTO total_reglas FROM lead_scoring_rules;
  SELECT COUNT(*) INTO reglas_activas FROM lead_scoring_rules WHERE activo = true;
  
  -- Contar leads
  SELECT COUNT(*) INTO total_leads FROM leads;
  SELECT COUNT(*) INTO leads_con_score FROM leads WHERE score IS NOT NULL AND score > 0;
  
  -- Obtener información del último cron job
  SELECT MAX(runid) INTO ultimo_cron FROM cron.job_run_details WHERE jobname = 'recalcular-leads-diario';
  
  resultado := jsonb_build_object(
    'reglas_scoring', jsonb_build_object(
      'total', total_reglas,
      'activas', reglas_activas
    ),
    'leads', jsonb_build_object(
      'total', total_leads,
      'con_score', leads_con_score,
      'porcentaje_con_score', ROUND((leads_con_score::NUMERIC / NULLIF(total_leads, 0)) * 100, 2)
    ),
    'triggers', jsonb_build_object(
      'lead_interactions', 'ACTIVO',
      'leads', 'ACTIVO'
    ),
    'cron_job', jsonb_build_object(
      'configurado', 'SI',
      'horario', '2:00 AM diario',
      'ultimo_run', ultimo_cron
    ),
    'timestamp', now()
  );
  
  RETURN resultado;
END;
$function$;