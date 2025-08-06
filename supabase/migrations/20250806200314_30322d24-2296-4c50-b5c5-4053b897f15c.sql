-- Crear tabla para almacenar las etapas del pipeline M&A
CREATE TABLE IF NOT EXISTS public.ma_pipeline_stages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  probability_pct INTEGER NOT NULL CHECK (probability_pct >= 0 AND probability_pct <= 100),
  stage_order INTEGER NOT NULL UNIQUE,
  condition_to_advance TEXT,
  automation TEXT,
  color TEXT DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar las etapas del pipeline M&A si no existen
INSERT INTO public.ma_pipeline_stages (name, description, probability_pct, stage_order, condition_to_advance, automation, color, is_active)
VALUES 
  ('New Lead', 'Captura inicial (web, referral, evento)', 5, 1, 'Lead asignado', 'Slack → BD asignado', '#ef4444', true),
  ('Qualified', 'Llamada pre-screen (sector, EV, motivación)', 15, 2, 'Campos Mandate Type, EV Range completados', 'Crear tarea "Enviar NDA"', '#f97316', true),
  ('NDA Sent', 'NDA enviado vía DocuSign', 25, 3, 'Firma', 'Recordatorio 72 h', '#eab308', true),
  ('NDA Signed', 'NDA firmado', 30, 4, 'Teaser / Search Brief enviado', 'Stage cambia auto (webhook)', '#84cc16', true),
  ('Info Shared', 'Teaser (sell) o Brief (buy) + call management', 40, 5, 'Reunión hecha / IOI solicitada', 'Crear Zoom link + tarea', '#06b6d4', true),
  ('Negotiation', 'Iterar borrador de Mandato', 70, 6, 'Versión final aceptada', 'Reminder cada 5 d sin feedback', '#3b82f6', true),
  ('Mandate Signed', 'Mandato firmado', 100, 7, 'Firma DocuSign', 'Crear Deal en pipeline "Execution"', '#22c55e', true),
  ('Closed Lost', 'Descualificado o rechazo', 0, 8, '—', 'Motivo de pérdida obligatorio', '#6b7280', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  probability_pct = EXCLUDED.probability_pct,
  stage_order = EXCLUDED.stage_order,
  condition_to_advance = EXCLUDED.condition_to_advance,
  automation = EXCLUDED.automation,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_ma_pipeline_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ma_pipeline_stages_updated_at ON public.ma_pipeline_stages;
CREATE TRIGGER update_ma_pipeline_stages_updated_at
  BEFORE UPDATE ON public.ma_pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ma_pipeline_stages_updated_at();

-- Habilitar RLS en la tabla
ALTER TABLE public.ma_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan leer las etapas
CREATE POLICY "Authenticated users can view pipeline stages" ON public.ma_pipeline_stages
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Política para que solo los administradores puedan modificar las etapas
CREATE POLICY "Only admins can modify pipeline stages" ON public.ma_pipeline_stages
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ma_pipeline_stages_order ON public.ma_pipeline_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_ma_pipeline_stages_active ON public.ma_pipeline_stages(is_active);
CREATE INDEX IF NOT EXISTS idx_ma_pipeline_stages_name ON public.ma_pipeline_stages(name);