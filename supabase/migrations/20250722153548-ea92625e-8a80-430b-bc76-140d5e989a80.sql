
-- Agregar campos de honorarios a la tabla valoraciones
ALTER TABLE public.valoraciones 
ADD COLUMN fee_quoted NUMERIC(10,2),
ADD COLUMN fee_charged NUMERIC(10,2) DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
ADD COLUMN fee_currency TEXT DEFAULT 'EUR',
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_notes TEXT;

-- Agregar constraint para que fee_charged no sea mayor que fee_quoted
ALTER TABLE public.valoraciones 
ADD CONSTRAINT check_fee_charged_not_greater_than_quoted 
CHECK (fee_charged IS NULL OR fee_quoted IS NULL OR fee_charged <= fee_quoted);

-- Crear índice para consultas de honorarios
CREATE INDEX idx_valoraciones_payment_status ON public.valoraciones(payment_status);
CREATE INDEX idx_valoraciones_fee_charged ON public.valoraciones(fee_charged);
