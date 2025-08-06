-- Corregir la función para agregar search_path
CREATE OR REPLACE FUNCTION clean_valoracion_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;