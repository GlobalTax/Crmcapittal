-- Add mandate_type field to buying_mandates table
ALTER TABLE public.buying_mandates 
ADD COLUMN mandate_type text NOT NULL DEFAULT 'compra';

-- Add check constraint to ensure only valid values
ALTER TABLE public.buying_mandates 
ADD CONSTRAINT mandate_type_check 
CHECK (mandate_type IN ('compra', 'venta'));

-- Add index for better performance when filtering by mandate_type
CREATE INDEX idx_buying_mandates_mandate_type ON public.buying_mandates(mandate_type);