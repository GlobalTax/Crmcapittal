-- Fix order: quitar restricción, normalizar datos y volver a crearla
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_priority_check;

UPDATE public.leads
SET priority = 'medium'
WHERE priority IS NULL OR priority NOT IN ('low','medium','high','urgent');

ALTER TABLE public.leads
  ALTER COLUMN priority SET DEFAULT 'medium';

ALTER TABLE public.leads
  ADD CONSTRAINT leads_priority_check CHECK (priority IN ('low','medium','high','urgent'));
