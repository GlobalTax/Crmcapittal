-- Fase 1: Estructura de Base de Datos para Sistema Winback

-- 1.1 Actualizar tabla leads con campos winback
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS last_winback_attempt date,
ADD COLUMN IF NOT EXISTS winback_stage text DEFAULT 'cold';

-- Crear constraint para winback_stage si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'leads_winback_stage_check'
    ) THEN
        ALTER TABLE leads 
        ADD CONSTRAINT leads_winback_stage_check 
        CHECK (winback_stage IN ('cold', 'campaign_sent', 'engaging', 'reopened', 'irrecuperable'));
    END IF;
END $$;

-- 1.2 Crear tabla winback_sequences
CREATE TABLE IF NOT EXISTS winback_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  pasos jsonb NOT NULL DEFAULT '[]'::jsonb,
  lost_reason_trigger text, -- para auto-asignar secuencias según motivo de pérdida
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Enable RLS on winback_sequences
ALTER TABLE winback_sequences ENABLE ROW LEVEL SECURITY;

-- RLS policies for winback_sequences
CREATE POLICY "Admin users can manage winback sequences" ON winback_sequences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 1.3 Crear tabla winback_attempts
CREATE TABLE IF NOT EXISTS winback_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  sequence_id uuid NOT NULL,
  step_index integer NOT NULL,
  canal text NOT NULL, -- email, call, linkedin, etc.
  template_id uuid, -- referencia a plantilla si aplica
  scheduled_date date NOT NULL,
  executed_date timestamp with time zone,
  status text DEFAULT 'pending',
  response_data jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Add constraint for status
ALTER TABLE winback_attempts 
ADD CONSTRAINT winback_attempts_status_check 
CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'responded', 'skipped'));

-- Enable RLS on winback_attempts
ALTER TABLE winback_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for winback_attempts
CREATE POLICY "Users can view winback attempts for their leads" ON winback_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = winback_attempts.lead_id 
    AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can manage winback attempts" ON winback_attempts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 1.4 Crear función para iniciar secuencia winback
CREATE OR REPLACE FUNCTION initiate_winback_sequence(
  p_lead_id uuid,
  p_sequence_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record RECORD;
  sequence_record RECORD;
  step_record jsonb;
  step_index INTEGER;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  -- Si no se especifica secuencia, buscar una apropiada
  IF p_sequence_id IS NULL THEN
    SELECT * INTO sequence_record 
    FROM winback_sequences 
    WHERE activo = true 
    AND (lost_reason_trigger IS NULL OR lost_reason_trigger = lead_record.lost_reason)
    ORDER BY created_at DESC 
    LIMIT 1;
  ELSE
    SELECT * INTO sequence_record 
    FROM winback_sequences 
    WHERE id = p_sequence_id AND activo = true;
  END IF;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró secuencia winback válida';
  END IF;
  
  -- Crear intentos para todos los pasos de la secuencia
  step_index := 0;
  FOR step_record IN SELECT * FROM jsonb_array_elements(sequence_record.pasos)
  LOOP
    INSERT INTO winback_attempts (
      lead_id,
      sequence_id,
      step_index,
      canal,
      template_id,
      scheduled_date,
      created_by
    ) VALUES (
      p_lead_id,
      sequence_record.id,
      step_index,
      step_record->>'canal',
      (step_record->>'template_id')::uuid,
      CURRENT_DATE + INTERVAL '1 day' * (step_record->>'dias')::integer,
      auth.uid()
    );
    
    step_index := step_index + 1;
  END LOOP;
  
  -- Actualizar lead
  UPDATE leads 
  SET 
    winback_stage = 'campaign_sent',
    last_winback_attempt = CURRENT_DATE,
    updated_at = now()
  WHERE id = p_lead_id;
  
END;
$$;

-- 1.5 Función para marcar respuesta a winback
CREATE OR REPLACE FUNCTION mark_winback_response(
  p_lead_id uuid,
  p_response_type text DEFAULT 'positive'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Actualizar estado del lead según respuesta
  UPDATE leads 
  SET 
    winback_stage = CASE 
      WHEN p_response_type = 'positive' THEN 'reopened'
      WHEN p_response_type = 'negative' THEN 'irrecuperable'
      ELSE 'engaging'
    END,
    status = CASE 
      WHEN p_response_type = 'positive' THEN 'QUALIFIED'
      ELSE status
    END,
    updated_at = now()
  WHERE id = p_lead_id;
  
  -- Marcar intentos pendientes como respondidos
  UPDATE winback_attempts 
  SET 
    status = 'responded',
    response_data = jsonb_build_object(
      'response_type', p_response_type,
      'response_date', now()
    ),
    executed_date = now()
  WHERE lead_id = p_lead_id 
  AND status = 'pending';
  
END;
$$;

-- 1.6 Trigger para auto-iniciar winback cuando lead pasa a lost
CREATE OR REPLACE FUNCTION auto_initiate_winback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Solo si cambia a status LOST y no tenía winback previo
  IF NEW.status = 'LOST' 
     AND (OLD.status != 'LOST' OR OLD.status IS NULL)
     AND NEW.winback_stage = 'cold' 
     AND NEW.lost_reason IS NOT NULL
  THEN
    -- Iniciar secuencia winback automáticamente
    PERFORM initiate_winback_sequence(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_auto_winback ON leads;
CREATE TRIGGER trigger_auto_winback
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_initiate_winback();

-- 1.7 Trigger para updated_at en winback_sequences
CREATE OR REPLACE FUNCTION update_winback_sequences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_winback_sequences_updated_at
  BEFORE UPDATE ON winback_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_winback_sequences_updated_at();

-- Insertar secuencias de ejemplo
INSERT INTO winback_sequences (nombre, descripcion, pasos, lost_reason_trigger, created_by) VALUES
(
  'Secuencia Precio',
  'Para leads perdidos por motivos de precio',
  '[
    {
      "dias": 0,
      "canal": "email",
      "asunto": "¿Podemos adaptar nuestra propuesta?",
      "prioridad": "high"
    },
    {
      "dias": 7,
      "canal": "call", 
      "script": "Llamada para entender limitaciones presupuestarias",
      "duracion_esperada": 15
    },
    {
      "dias": 21,
      "canal": "email",
      "asunto": "Nueva oferta especial para ti",
      "descuento": true
    }
  ]'::jsonb,
  'precio',
  auth.uid()
),
(
  'Secuencia Timing',
  'Para leads perdidos por timing',
  '[
    {
      "dias": 0,
      "canal": "email",
      "asunto": "Mantenemos tu propuesta disponible",
      "prioridad": "medium"
    },
    {
      "dias": 30,
      "canal": "linkedin",
      "mensaje": "¿Ha cambiado el timing para tu proyecto?",
      "conexion_requerida": false
    },
    {
      "dias": 90,
      "canal": "email",
      "asunto": "¿Es el momento adecuado ahora?",
      "estacional": true
    }
  ]'::jsonb,
  'timing',
  auth.uid()
),
(
  'Secuencia Sin Respuesta',
  'Para leads que no responden',
  '[
    {
      "dias": 0,
      "canal": "email",
      "asunto": "¿Te perdimos en el camino?",
      "prioridad": "medium"
    },
    {
      "dias": 3,
      "canal": "call",
      "script": "Llamada de seguimiento cordial",
      "duracion_esperada": 10
    },
    {
      "dias": 14,
      "canal": "linkedin", 
      "mensaje": "Últimos desarrollos que podrían interesarte",
      "contenido_valor": true
    }
  ]'::jsonb,
  'sin respuesta',
  auth.uid()
);