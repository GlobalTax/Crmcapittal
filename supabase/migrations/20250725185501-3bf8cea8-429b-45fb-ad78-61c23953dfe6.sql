-- Migración Segura para Valoraciones (Opción A - Corregida)
-- Mantiene campos existentes y agrega solo campos nuevos seguros

-- 1. Actualizar constraints de status para incluir 'archived'
ALTER TABLE valoraciones DROP CONSTRAINT IF EXISTS valoraciones_status_check;
ALTER TABLE valoraciones ADD CONSTRAINT valoraciones_status_check 
    CHECK (status IN ('requested', 'in_process', 'completed', 'delivered', 'archived'));

-- 2. Actualizar constraints de priority para incluir valores en español
ALTER TABLE valoraciones DROP CONSTRAINT IF EXISTS valoraciones_priority_check;
ALTER TABLE valoraciones ADD CONSTRAINT valoraciones_priority_check 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'baja', 'media', 'alta', 'critica'));

-- 3. Agregar campos nuevos seguros a la tabla valoraciones
ALTER TABLE valoraciones
ADD COLUMN IF NOT EXISTS solicitante_id bigint REFERENCES clientes(regid),
ADD COLUMN IF NOT EXISTS analista_id uuid REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS metodo_preferente text,
ADD COLUMN IF NOT EXISTS valoración_ev numeric,
ADD COLUMN IF NOT EXISTS valoración_eqty numeric,
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now();

-- 4. Actualizar last_activity_at para registros existentes
UPDATE valoraciones 
SET last_activity_at = COALESCE(updated_at, created_at)
WHERE last_activity_at IS NULL;

-- 5. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_valoraciones_solicitante ON valoraciones(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_analista ON valoraciones(analista_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_last_activity ON valoraciones(last_activity_at);

-- 6. Comentarios para documentar la migración segura
COMMENT ON COLUMN valoraciones.solicitante_id IS 'FK a clientes - quien solicita la valoración';
COMMENT ON COLUMN valoraciones.analista_id IS 'FK a user_profiles - analista asignado';
COMMENT ON COLUMN valoraciones.metodo_preferente IS 'Método preferido de valoración';
COMMENT ON COLUMN valoraciones.valoración_ev IS 'Valoración Enterprise Value';
COMMENT ON COLUMN valoraciones.valoración_eqty IS 'Valoración Equity Value';
COMMENT ON COLUMN valoraciones.pdf_url IS 'URL del PDF generado';
COMMENT ON COLUMN valoraciones.last_activity_at IS 'Timestamp de última actividad';