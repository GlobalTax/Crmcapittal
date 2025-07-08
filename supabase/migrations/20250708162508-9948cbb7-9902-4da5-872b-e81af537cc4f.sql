
-- Añadir campo responsible_user_id a mandate_targets
ALTER TABLE public.mandate_targets 
ADD COLUMN responsible_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Añadir índice para mejorar performance en consultas
CREATE INDEX idx_mandate_targets_responsible_user_id ON public.mandate_targets(responsible_user_id);

-- Actualizar trigger de updated_at (ya existe, pero verificamos)
DROP TRIGGER IF EXISTS update_mandate_targets_updated_at ON public.mandate_targets;
CREATE TRIGGER update_mandate_targets_updated_at
  BEFORE UPDATE ON public.mandate_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
