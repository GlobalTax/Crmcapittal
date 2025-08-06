-- Limpieza de datos crítica para valoraciones
-- Paso 1: Identificar y limpiar UUIDs erróneos en company_name
UPDATE valoraciones 
SET company_name = 'Empresa sin nombre'
WHERE company_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Paso 2: Normalizar campos nulos
UPDATE valoraciones 
SET 
  client_name = COALESCE(NULLIF(client_name, ''), 'Cliente sin especificar'),
  company_sector = COALESCE(NULLIF(company_sector, ''), 'Sin sector'),
  status = COALESCE(status, 'requested'),
  priority = COALESCE(priority, 'medium');

-- Paso 3: Agregar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_valoraciones_status ON valoraciones(status);
CREATE INDEX IF NOT EXISTS idx_valoraciones_priority ON valoraciones(priority);
CREATE INDEX IF NOT EXISTS idx_valoraciones_created_at ON valoraciones(created_at);
CREATE INDEX IF NOT EXISTS idx_valoraciones_company_name ON valoraciones(company_name);

-- Paso 4: Validaciones a nivel de base de datos
ALTER TABLE valoraciones 
ADD CONSTRAINT check_company_name_not_uuid 
CHECK (company_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Paso 5: Función para limpiar datos automáticamente
CREATE OR REPLACE FUNCTION clean_valoracion_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpiar company_name si es un UUID
  IF NEW.company_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    NEW.company_name := 'Empresa sin nombre';
  END IF;
  
  -- Normalizar campos vacíos
  NEW.client_name := COALESCE(NULLIF(NEW.client_name, ''), 'Cliente sin especificar');
  NEW.company_sector := COALESCE(NULLIF(NEW.company_sector, ''), 'Sin sector');
  NEW.status := COALESCE(NEW.status, 'requested');
  NEW.priority := COALESCE(NEW.priority, 'medium');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_clean_valoracion_data ON valoraciones;
CREATE TRIGGER trigger_clean_valoracion_data
  BEFORE INSERT OR UPDATE ON valoraciones
  FOR EACH ROW EXECUTE FUNCTION clean_valoracion_data();