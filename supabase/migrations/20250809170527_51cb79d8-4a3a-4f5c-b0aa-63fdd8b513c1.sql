-- Fix: asegurar columnas requeridas en lead_task_sla_policies y resembrar
-- Añadir columnas si faltan
ALTER TABLE public.lead_task_sla_policies
  ADD COLUMN IF NOT EXISTS priority public.lead_task_priority,
  ADD COLUMN IF NOT EXISTS task_type public.lead_task_type,
  ADD COLUMN IF NOT EXISTS sla_hours integer,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ajustar defaults y NOT NULL donde sea necesario
ALTER TABLE public.lead_task_sla_policies
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Establecer valores por defecto en filas existentes para evitar NOT NULL violations
UPDATE public.lead_task_sla_policies
SET priority = COALESCE(priority, 'medium')::public.lead_task_priority
WHERE priority IS NULL;

UPDATE public.lead_task_sla_policies
SET task_type = COALESCE(task_type, 'llamada')::public.lead_task_type
WHERE task_type IS NULL;

UPDATE public.lead_task_sla_policies
SET sla_hours = COALESCE(sla_hours, 48)
WHERE sla_hours IS NULL;

-- Ahora forzar NOT NULL
ALTER TABLE public.lead_task_sla_policies
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN task_type SET NOT NULL,
  ALTER COLUMN sla_hours SET NOT NULL;

-- Asegurar constraint de unicidad (task_type, priority)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lead_task_sla_policies_unique'
  ) THEN
    ALTER TABLE public.lead_task_sla_policies
    ADD CONSTRAINT lead_task_sla_policies_unique UNIQUE (task_type, priority);
  END IF;
END $$;

-- Trigger de updated_at en SLA si no existe
DROP TRIGGER IF EXISTS trg_lead_task_sla_policies_updated_at ON public.lead_task_sla_policies;
CREATE TRIGGER trg_lead_task_sla_policies_updated_at
BEFORE UPDATE ON public.lead_task_sla_policies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Semillas SLA (upsert)
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