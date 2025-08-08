-- PASO 1: ENFOQUE SEGURO - Normalización de Datos y Funciones de Limpieza
-- ========================================================================

-- 1. Función para normalizar teléfonos (formato internacional)
CREATE OR REPLACE FUNCTION public.normalize_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF phone_input IS NULL OR trim(phone_input) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remover espacios, guiones, paréntesis
  phone_input := regexp_replace(phone_input, '[\\s\\-\\(\\)\\.]', '', 'g');
  
  -- Si empieza con +34, mantenerlo
  IF phone_input ~ '^\\+34' THEN
    RETURN phone_input;
  END IF;
  
  -- Si empieza con 34, añadir +
  IF phone_input ~ '^34[6-9]' THEN
    RETURN '+' || phone_input;
  END IF;
  
  -- Si es móvil español (6,7,8,9), añadir +34
  IF phone_input ~ '^[6-9][0-9]{8}$' THEN
    RETURN '+34' || phone_input;
  END IF;
  
  -- Otros casos internacionales
  IF phone_input ~ '^[0-9]+$' AND length(phone_input) >= 9 THEN
    RETURN '+' || phone_input;
  END IF;
  
  -- Devolver original si no se puede normalizar
  RETURN phone_input;
END;
$$;

-- 2. Función para extraer dominio de email
CREATE OR REPLACE FUNCTION public.extract_email_domain(email_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF email_input IS NULL OR email_input !~ '^[^@]+@[^@]+\\.[^@]+$' THEN
    RETURN NULL;
  END IF;
  
  RETURN lower(trim(split_part(email_input, '@', 2)));
END;
$$;

-- 3. Función para normalizar nombres de empresa
CREATE OR REPLACE FUNCTION public.normalize_company_name(name_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF name_input IS NULL OR trim(name_input) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Limpiar y normalizar
  name_input := trim(name_input);
  name_input := regexp_replace(name_input, '\\s+', ' ', 'g'); -- Múltiples espacios a uno
  
  -- Title case para palabras principales
  name_input := initcap(lower(name_input));
  
  -- Mayúsculas para abreviaciones comunes
  name_input := regexp_replace(name_input, '\\bSl\\b', 'SL', 'gi');
  name_input := regexp_replace(name_input, '\\bSa\\b', 'SA', 'gi');
  name_input := regexp_replace(name_input, '\\bSlu\\b', 'SLU', 'gi');
  name_input := regexp_replace(name_input, '\\bSp\\b', 'SP', 'gi');
  name_input := regexp_replace(name_input, '\\bLtd\\b', 'Ltd', 'gi');
  name_input := regexp_replace(name_input, '\\bLlc\\b', 'LLC', 'gi');
  
  RETURN name_input;
END;
$$;

-- 4. Función para split nombre completo en first_name/last_name
CREATE OR REPLACE FUNCTION public.split_full_name(full_name text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parts text[];
  first_name text;
  last_name text;
BEGIN
  IF full_name IS NULL OR trim(full_name) = '' THEN
    RETURN jsonb_build_object('first_name', NULL, 'last_name', NULL);
  END IF;
  
  -- Limpiar y dividir por espacios
  full_name := trim(regexp_replace(full_name, '\\s+', ' ', 'g'));
  parts := string_to_array(full_name, ' ');
  
  -- Si solo hay una palabra, va a first_name
  IF array_length(parts, 1) = 1 THEN
    first_name := parts[1];
    last_name := NULL;
  ELSE
    -- Primera palabra = first_name, resto = last_name
    first_name := parts[1];
    last_name := array_to_string(parts[2:array_length(parts,1)], ' ');
  END IF;
  
  RETURN jsonb_build_object(
    'first_name', initcap(lower(first_name)),
    'last_name', CASE WHEN last_name IS NOT NULL THEN initcap(lower(last_name)) ELSE NULL END
  );
END;
$$;

-- 5. Función para crear empresa desde dominio email (QuickCreate)
CREATE OR REPLACE FUNCTION public.quick_create_company_from_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  domain_name text;
  company_name text;
  new_company_id uuid;
  existing_company_id uuid;
BEGIN
  -- Extraer dominio
  domain_name := public.extract_email_domain(email_input);
  
  IF domain_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar empresa existente por dominio
  SELECT id INTO existing_company_id 
  FROM companies 
  WHERE domain = domain_name 
  LIMIT 1;
  
  IF existing_company_id IS NOT NULL THEN
    RETURN existing_company_id;
  END IF;
  
  -- Crear nombre de empresa desde dominio
  company_name := initcap(replace(split_part(domain_name, '.', 1), '-', ' '));
  
  -- Crear nueva empresa
  INSERT INTO companies (
    name,
    domain,
    country,
    company_size,
    company_type,
    company_status,
    lifecycle_stage,
    is_target_account,
    is_key_account,
    is_franquicia,
    created_at
  ) VALUES (
    company_name,
    domain_name,
    'España',
    '11-50',
    'prospect',
    'prospecto',
    'lead',
    false,
    false,
    false,
    now()
  ) RETURNING id INTO new_company_id;
  
  RETURN new_company_id;
END;
$$;

-- 6. Añadir columnas temporales para normalización
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS phone_normalized text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS email_domain text;

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS name_normalized text;

-- 7. Normalizar datos existentes
UPDATE contacts SET 
  phone_normalized = public.normalize_phone(phone),
  email_domain = public.extract_email_domain(email),
  first_name = (public.split_full_name(name)->>'first_name'),
  last_name = (public.split_full_name(name)->>'last_name')
WHERE phone IS NOT NULL OR email IS NOT NULL OR name IS NOT NULL;

UPDATE companies SET 
  name_normalized = public.normalize_company_name(name)
WHERE name IS NOT NULL;

-- 8. Crear empresas para contacts sin company_id usando QuickCreate
UPDATE contacts 
SET company_id = public.quick_create_company_from_email(email)
WHERE company_id IS NULL 
AND email IS NOT NULL 
AND email ~ '^[^@]+@[^@]+\\.[^@]+$';

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_contacts_email_company ON contacts(email, company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_normalized ON contacts(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_companies_name_normalized ON companies(name_normalized);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- 10. Triggers para mantener normalización automática
CREATE OR REPLACE FUNCTION public.trigger_normalize_contact()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  name_parts jsonb;
BEGIN
  -- Normalizar teléfono
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone_normalized := public.normalize_phone(NEW.phone);
  END IF;
  
  -- Extraer dominio de email
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email_domain := public.extract_email_domain(NEW.email);
  END IF;
  
  -- Split nombre completo
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    name_parts := public.split_full_name(NEW.name);
    NEW.first_name := name_parts->>'first_name';
    NEW.last_name := name_parts->>'last_name';
  END IF;
  
  -- Auto-assign company_id si falta y tenemos email
  IF NEW.company_id IS NULL AND NEW.email IS NOT NULL THEN
    NEW.company_id := public.quick_create_company_from_email(NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_normalize_company()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalizar nombre de empresa
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.name_normalized := public.normalize_company_name(NEW.name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear triggers
DROP TRIGGER IF EXISTS trigger_normalize_contact_data ON contacts;
CREATE TRIGGER trigger_normalize_contact_data
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_normalize_contact();

DROP TRIGGER IF EXISTS trigger_normalize_company_data ON companies;
CREATE TRIGGER trigger_normalize_company_data
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_normalize_company();

-- Log de progreso
INSERT INTO public.automation_logs (
  automation_type,
  trigger_event,
  entity_type,
  entity_id,
  action_taken,
  status,
  action_data
) VALUES (
  'data_normalization',
  'migration_safe_approach',
  'system',
  gen_random_uuid(),
  'Normalización segura de datos implementada',
  'success',
  jsonb_build_object(
    'phase', 'step_1_normalization',
    'timestamp', now(),
    'functions_created', 5,
    'triggers_created', 2
  )
);