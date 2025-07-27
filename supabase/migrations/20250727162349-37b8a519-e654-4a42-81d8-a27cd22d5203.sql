-- Migración para actualizar lead_scoring_rules y crear lead_score_logs

-- 1. Modificar tabla lead_scoring_rules para usar nombres en español
ALTER TABLE public.lead_scoring_rules 
  RENAME COLUMN name TO nombre;

ALTER TABLE public.lead_scoring_rules 
  RENAME COLUMN trigger_condition TO condicion;

ALTER TABLE public.lead_scoring_rules 
  RENAME COLUMN points_awarded TO valor;

ALTER TABLE public.lead_scoring_rules 
  RENAME COLUMN is_active TO activo;

-- Cambiar tipo de dato de valor a numeric
ALTER TABLE public.lead_scoring_rules 
  ALTER COLUMN valor TYPE NUMERIC;

-- 2. Crear tabla lead_score_logs
CREATE TABLE public.lead_score_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  regla TEXT NOT NULL,
  delta NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS en lead_score_logs
ALTER TABLE public.lead_score_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para lead_score_logs
CREATE POLICY "Users can view lead score logs" 
ON public.lead_score_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_score_logs.lead_id 
    AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "System can insert lead score logs" 
ON public.lead_score_logs 
FOR INSERT 
WITH CHECK (true);

-- 5. Índices para rendimiento
CREATE INDEX idx_lead_score_logs_lead_id ON public.lead_score_logs(lead_id);
CREATE INDEX idx_lead_score_logs_fecha ON public.lead_score_logs(fecha DESC);

-- 6. Función para registrar cambios de puntuación
CREATE OR REPLACE FUNCTION public.log_lead_score_change(
  p_lead_id UUID,
  p_regla TEXT,
  p_delta NUMERIC,
  p_total NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.lead_score_logs (lead_id, regla, delta, total)
  VALUES (p_lead_id, p_regla, p_delta, p_total)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;