
-- Agregar campos necesarios para reconversiones más detalladas
ALTER TABLE reconversiones 
ADD COLUMN IF NOT EXISTS investment_capacity_min NUMERIC,
ADD COLUMN IF NOT EXISTS investment_capacity_max NUMERIC,
ADD COLUMN IF NOT EXISTS revenue_range_min NUMERIC,
ADD COLUMN IF NOT EXISTS revenue_range_max NUMERIC,
ADD COLUMN IF NOT EXISTS ebitda_range_min NUMERIC,
ADD COLUMN IF NOT EXISTS ebitda_range_max NUMERIC,
ADD COLUMN IF NOT EXISTS deal_structure_preferences TEXT[],
ADD COLUMN IF NOT EXISTS timeline_horizon TEXT,
ADD COLUMN IF NOT EXISTS target_locations TEXT[],
ADD COLUMN IF NOT EXISTS buyer_company_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_contact_info JSONB,
ADD COLUMN IF NOT EXISTS original_mandate_id UUID,
ADD COLUMN IF NOT EXISTS original_rejection_reason TEXT;

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN reconversiones.investment_capacity_min IS 'Capacidad mínima de inversión del comprador';
COMMENT ON COLUMN reconversiones.investment_capacity_max IS 'Capacidad máxima de inversión del comprador';
COMMENT ON COLUMN reconversiones.revenue_range_min IS 'Rango mínimo de ingresos objetivo';
COMMENT ON COLUMN reconversiones.revenue_range_max IS 'Rango máximo de ingresos objetivo';
COMMENT ON COLUMN reconversiones.ebitda_range_min IS 'Rango mínimo de EBITDA objetivo';
COMMENT ON COLUMN reconversiones.ebitda_range_max IS 'Rango máximo de EBITDA objetivo';
COMMENT ON COLUMN reconversiones.deal_structure_preferences IS 'Preferencias de estructura del deal (adquisición, partnership, fusión)';
COMMENT ON COLUMN reconversiones.timeline_horizon IS 'Horizonte temporal para la operación';
COMMENT ON COLUMN reconversiones.target_locations IS 'Localizaciones objetivo del comprador';
COMMENT ON COLUMN reconversiones.buyer_company_name IS 'Nombre de la empresa compradora';
COMMENT ON COLUMN reconversiones.buyer_contact_info IS 'Información de contacto del comprador (JSON)';
COMMENT ON COLUMN reconversiones.original_mandate_id IS 'ID del mandato de venta original';
COMMENT ON COLUMN reconversiones.original_rejection_reason IS 'Motivo original del rechazo';
