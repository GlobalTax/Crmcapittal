-- 1. Mejorar el trigger para recalcular prob_conversion cuando cambie el score
CREATE OR REPLACE FUNCTION trigger_update_prob_conversion()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si cambió el score
  IF OLD.score IS DISTINCT FROM NEW.score THEN
    NEW.prob_conversion = LEAST(1.0, GREATEST(0.0, COALESCE(NEW.score, 0) / 100.0));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurar que el trigger existe en la tabla leads
DROP TRIGGER IF EXISTS update_prob_conversion_on_score_change ON leads;
CREATE TRIGGER update_prob_conversion_on_score_change
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_prob_conversion();

-- 2. Crear vista vw_winback_kpi para métricas del sistema winback
CREATE OR REPLACE VIEW vw_winback_kpi AS
WITH winback_leads AS (
  -- Leads que han tenido al menos un intento winback
  SELECT DISTINCT 
    l.id,
    l.name,
    l.winback_stage,
    l.score,
    l.lost_date,
    l.created_at
  FROM leads l
  INNER JOIN winback_attempts wa ON l.id = wa.lead_id
),
perdidos_en_campana AS (
  -- Leads que están en proceso winback (no irrecuperables)
  SELECT COUNT(*) as total
  FROM winback_leads 
  WHERE winback_stage IN ('cold', 'campaign_sent', 'engaging')
),
reabiertos AS (
  -- Leads que han sido reabiertos exitosamente
  SELECT COUNT(*) as total
  FROM winback_leads 
  WHERE winback_stage IN ('engaging', 'reopened')
),
tiempo_respuesta AS (
  -- Calcular tiempo promedio hasta primera respuesta positiva
  SELECT 
    l.id as lead_id,
    MIN(wa.executed_date) as primera_campana,
    MAX(CASE 
      WHEN l.winback_stage IN ('engaging', 'reopened') 
      THEN wa.executed_date 
      ELSE NULL 
    END) as fecha_reactivacion
  FROM leads l
  INNER JOIN winback_attempts wa ON l.id = wa.lead_id
  WHERE wa.status = 'sent'
  GROUP BY l.id
),
respuesta_media AS (
  SELECT 
    AVG(
      EXTRACT(DAYS FROM (fecha_reactivacion::timestamp - primera_campana::timestamp))
    ) as dias_promedio
  FROM tiempo_respuesta 
  WHERE fecha_reactivacion IS NOT NULL
)
SELECT
  pc.total as tot_perdidos_en_campana,
  r.total as reabiertos,
  CASE 
    WHEN pc.total > 0 
    THEN ROUND((r.total::decimal / pc.total::decimal) * 100, 2)
    ELSE 0 
  END as win_rate,
  COALESCE(ROUND(rm.dias_promedio, 1), 0) as respuesta_media_dias,
  -- Métricas adicionales útiles
  (SELECT COUNT(*) FROM winback_leads WHERE winback_stage = 'irrecuperable') as irrecuperables,
  (SELECT COUNT(*) FROM winback_attempts WHERE status = 'pending') as intentos_pendientes,
  (SELECT COUNT(*) FROM winback_attempts WHERE status = 'sent' AND DATE(executed_date) = CURRENT_DATE) as enviados_hoy
FROM perdidos_en_campana pc
CROSS JOIN reabiertos r
CROSS JOIN respuesta_media rm;

-- 3. Crear función para recalcular prob_conversion manualmente
CREATE OR REPLACE FUNCTION recalcular_prob_conversion_lead(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_score INTEGER;
  new_prob_conversion NUMERIC;
BEGIN
  -- Obtener score actual del lead
  SELECT COALESCE(score, 0) INTO current_score
  FROM leads 
  WHERE id = p_lead_id;
  
  -- Calcular nueva probabilidad: min(1, score/100)
  new_prob_conversion := LEAST(1.0, GREATEST(0.0, current_score / 100.0));
  
  -- Actualizar lead
  UPDATE leads 
  SET prob_conversion = new_prob_conversion
  WHERE id = p_lead_id;
  
  RAISE NOTICE 'Lead % - Score: %, nueva prob_conversion: %', p_lead_id, current_score, new_prob_conversion;
END;
$$;

-- 4. Función para recalcular todas las prob_conversion de leads en winback
CREATE OR REPLACE FUNCTION recalcular_todas_prob_conversion_winback()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record RECORD;
  total_updated INTEGER := 0;
BEGIN
  -- Recalcular para todos los leads que tienen winback_stage
  FOR lead_record IN 
    SELECT id, score 
    FROM leads 
    WHERE winback_stage IS NOT NULL
  LOOP
    PERFORM recalcular_prob_conversion_lead(lead_record.id);
    total_updated := total_updated + 1;
  END LOOP;
  
  RAISE NOTICE 'Recalculadas prob_conversion para % leads en winback', total_updated;
END;
$$;