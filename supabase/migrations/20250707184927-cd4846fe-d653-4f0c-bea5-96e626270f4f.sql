-- Añadir campo lead_origin a la tabla leads
ALTER TABLE public.leads ADD COLUMN lead_origin text CHECK (lead_origin IN ('manual', 'webform', 'import'));

-- Añadir valor por defecto temporal para registros existentes
UPDATE public.leads SET lead_origin = 'manual' WHERE lead_origin IS NULL;

-- Hacer el campo NOT NULL después del update
ALTER TABLE public.leads ALTER COLUMN lead_origin SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN lead_origin SET DEFAULT 'manual';

-- Comentario sobre el campo
COMMENT ON COLUMN public.leads.lead_origin IS 'Origen del lead: manual (creado manualmente), webform (formulario web), import (importación)';

-- Verificar que exists un stage por defecto para nuevas oportunidades
-- Si no existe, crear uno
INSERT INTO public.stages (id, name, position, color, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Nueva',
  1,
  '#3B82F6',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Comentarios sobre la implementación
COMMENT ON TABLE public.leads IS 'Tabla de leads con seguimiento de origen y conversión automática';
COMMENT ON TABLE public.deals IS 'Tabla de oportunidades creadas desde leads convertidos';