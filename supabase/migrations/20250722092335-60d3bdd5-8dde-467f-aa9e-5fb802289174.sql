
-- Agregar tipo de servicio a la tabla leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'mandato_venta' 
  CHECK (service_type IN ('mandato_venta', 'mandato_compra', 'valoracion_empresa'));

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON public.leads(service_type);

-- Actualizar leads existentes con el valor por defecto
UPDATE public.leads 
SET service_type = 'mandato_venta' 
WHERE service_type IS NULL;
