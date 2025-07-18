-- Agregar solo las columnas que faltan en la tabla teasers
ALTER TABLE public.teasers 
ADD COLUMN IF NOT EXISTS mandate_id uuid REFERENCES public.buying_mandates(id),
ADD COLUMN IF NOT EXISTS teaser_type text CHECK (teaser_type IN ('venta', 'compra', 'standalone')) DEFAULT 'standalone';

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_teasers_mandate_id ON public.teasers(mandate_id);
CREATE INDEX IF NOT EXISTS idx_teasers_transaction_id ON public.teasers(transaction_id);
CREATE INDEX IF NOT EXISTS idx_teasers_type ON public.teasers(teaser_type);

-- Actualizar RLS policies para incluir nuevas relaciones
DROP POLICY IF EXISTS "Users can view teasers they created or admin" ON public.teasers;
CREATE POLICY "Users can view teasers they created or admin" ON public.teasers
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ) OR
  (mandate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM buying_mandates 
    WHERE id = mandate_id AND created_by = auth.uid()
  ))
);