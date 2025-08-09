-- Armonizar prioridades de leads con la app: permitir 'medium' y ponerlo por defecto
ALTER TABLE public.leads
  ALTER COLUMN priority SET DEFAULT 'medium';

-- Normalizar valores existentes (evita fallos al añadir la nueva CHECK)
UPDATE public.leads
SET priority = 'medium'
WHERE priority IS NULL OR priority NOT IN ('low','medium','high','urgent');

-- Reemplazar la restricción
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_priority_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_priority_check CHECK (
  priority IN ('low','medium','high','urgent')
);
