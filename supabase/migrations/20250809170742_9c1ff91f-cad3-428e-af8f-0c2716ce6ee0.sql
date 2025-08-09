-- Ajuste de constraint de unicidad para SLA policies y re-seed
ALTER TABLE public.lead_task_sla_policies
  DROP CONSTRAINT IF EXISTS lead_task_sla_policies_task_type_key;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lead_task_sla_policies_unique'
  ) THEN
    ALTER TABLE public.lead_task_sla_policies
    ADD CONSTRAINT lead_task_sla_policies_unique UNIQUE (task_type, priority);
  END IF;
END $$;

-- Re-seed con upsert
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