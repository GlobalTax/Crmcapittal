-- One-shot fix: añadir columna priority, normalizar, ajustar constraint y seed
-- 1) Asegurar columnas requeridas
ALTER TABLE public.lead_task_sla_policies
  ADD COLUMN IF NOT EXISTS priority public.lead_task_priority,
  ADD COLUMN IF NOT EXISTS task_type public.lead_task_type,
  ADD COLUMN IF NOT EXISTS sla_hours integer,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Defaults coherentes
ALTER TABLE public.lead_task_sla_policies
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- 2) Rellenar valores por defecto donde falten
UPDATE public.lead_task_sla_policies
SET priority = 'medium'::public.lead_task_priority
WHERE priority IS NULL;

UPDATE public.lead_task_sla_policies
SET task_type = 'llamada'::public.lead_task_type
WHERE task_type IS NULL;

UPDATE public.lead_task_sla_policies
SET sla_hours = 48
WHERE sla_hours IS NULL;

-- 3) Forzar NOT NULL tras normalizar
ALTER TABLE public.lead_task_sla_policies
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN task_type SET NOT NULL,
  ALTER COLUMN sla_hours SET NOT NULL;

-- 4) Ajustar constraints de unicidad
ALTER TABLE public.lead_task_sla_policies
  DROP CONSTRAINT IF EXISTS lead_task_sla_policies_task_type_key,
  DROP CONSTRAINT IF EXISTS lead_task_sla_policies_unique;

ALTER TABLE public.lead_task_sla_policies
  ADD CONSTRAINT lead_task_sla_policies_unique UNIQUE (task_type, priority);

-- 5) Trigger updated_at (idempotente)
DROP TRIGGER IF EXISTS trg_lead_task_sla_policies_updated_at ON public.lead_task_sla_policies;
CREATE TRIGGER trg_lead_task_sla_policies_updated_at
BEFORE UPDATE ON public.lead_task_sla_policies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6) Seed con upsert
INSERT INTO public.lead_task_sla_policies (task_type, priority, sla_hours, is_active)
SELECT x.task_type::public.lead_task_type, x.priority::public.lead_task_priority, x.sla_hours, true
FROM (
  VALUES
    ('llamada','urgent',24),
    ('llamada','high',48),
    ('llamada','medium',72),
    ('llamada','low',120),
    ('videollamada','medium',96),
    ('informe_mercado','medium',120),
    ('whatsapp','high',24),
    ('preguntas_reunion','medium',48)
) as x(task_type, priority, sla_hours)
ON CONFLICT (task_type, priority) DO UPDATE SET sla_hours = EXCLUDED.sla_hours, is_active = true;