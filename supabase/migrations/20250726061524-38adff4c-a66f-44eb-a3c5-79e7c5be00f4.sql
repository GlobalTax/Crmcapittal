-- Eliminar columnas duplicadas con tildes (mantener las sin tildes)
ALTER TABLE public.valoraciones DROP COLUMN IF EXISTS "valoración_ev";
ALTER TABLE public.valoraciones DROP COLUMN IF EXISTS "valoración_eqty";