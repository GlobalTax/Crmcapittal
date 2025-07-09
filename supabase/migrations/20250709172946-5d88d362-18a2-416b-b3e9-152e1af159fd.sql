-- Unificación de contactos: expansión de roles y migración de datos (CORREGIDA)

-- 1. Crear nuevos ENUMs para roles y estados más específicos
CREATE TYPE public.contact_role AS ENUM (
  'owner',
  'buyer', 
  'advisor',
  'investor',
  'target',
  'client',
  'prospect',
  'lead',
  'other'
);

CREATE TYPE public.contact_status AS ENUM (
  'active',
  'blocked', 
  'archived'
);

-- 2. Añadir nuevas columnas a la tabla contacts
ALTER TABLE public.contacts 
ADD COLUMN contact_roles contact_role[] DEFAULT ARRAY['other'::contact_role],
ADD COLUMN contact_status contact_status DEFAULT 'active'::contact_status,
ADD COLUMN source_table text,
ADD COLUMN external_id text;

-- 3. Migrar datos de mandate_targets a contacts
INSERT INTO public.contacts (
  name,
  email,
  phone,
  company,
  contact_type,
  contact_roles,
  contact_status,
  lifecycle_stage,
  notes,
  source_table,
  external_id,
  created_by,
  created_at,
  updated_at
)
SELECT 
  mt.contact_name as name,
  mt.contact_email as email,
  mt.contact_phone as phone,
  mt.company_name as company,
  'target'::text as contact_type,
  ARRAY['target'::contact_role] as contact_roles,
  CASE 
    WHEN mt.status = 'contacted' THEN 'active'::contact_status
    WHEN mt.status = 'not_interested' THEN 'archived'::contact_status
    ELSE 'active'::contact_status
  END as contact_status,
  'lead'::text as lifecycle_stage, -- Usar valor válido
  CONCAT('Migrado de mandate_targets. Estado original: ', mt.status, 
         CASE WHEN mt.notes IS NOT NULL THEN '. Notas: ' || mt.notes ELSE '' END) as notes,
  'mandate_targets' as source_table,
  mt.id::text as external_id,
  mt.created_by,
  mt.created_at,
  mt.updated_at
FROM mandate_targets mt
WHERE NOT EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.email = mt.contact_email 
  AND mt.contact_email IS NOT NULL
);

-- 4. Migrar datos de leads a contacts
INSERT INTO public.contacts (
  name,
  email,
  phone,
  company,
  contact_type,
  contact_roles,
  contact_status,
  lifecycle_stage,
  notes,
  source_table,
  external_id,
  created_by,
  created_at,
  updated_at
)
SELECT 
  l.name,
  l.email,
  l.phone,
  l.company_name as company,
  'lead'::text as contact_type,
  ARRAY['lead'::contact_role] as contact_roles,
  'active'::contact_status,
  CASE 
    WHEN l.status = 'NEW' THEN 'lead'
    WHEN l.status = 'CONTACTED' THEN 'lead'  -- Cambiar a valor válido
    WHEN l.status = 'QUALIFIED' THEN 'cliente'
    ELSE 'lead'
  END as lifecycle_stage,
  CONCAT('Migrado de leads. Fuente: ', l.source, 
         CASE WHEN l.message IS NOT NULL THEN '. Mensaje: ' || l.message ELSE '' END) as notes,
  'leads' as source_table,
  l.id::text as external_id,
  l.assigned_to_id,
  l.created_at,
  l.updated_at
FROM leads l
WHERE NOT EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.email = l.email 
  AND l.email IS NOT NULL
);

-- 5. Actualizar contactos existentes para usar los nuevos campos
UPDATE public.contacts 
SET 
  contact_roles = CASE 
    WHEN contact_type = 'cliente' THEN ARRAY['client'::contact_role]
    WHEN contact_type = 'prospect' THEN ARRAY['prospect'::contact_role]
    WHEN contact_type = 'franquicia' THEN ARRAY['owner'::contact_role]
    WHEN contact_type = 'marketing' THEN ARRAY['lead'::contact_role]
    WHEN contact_type = 'sales' THEN ARRAY['prospect'::contact_role]
    ELSE ARRAY['other'::contact_role]
  END,
  contact_status = CASE 
    WHEN is_active = false THEN 'archived'::contact_status
    ELSE 'active'::contact_status
  END
WHERE contact_roles IS NULL OR array_length(contact_roles, 1) IS NULL;

-- 6. Crear relaciones en contact_companies para los contactos migrados
INSERT INTO public.contact_companies (
  contact_id,
  company_name,
  is_primary,
  created_at,
  updated_at
)
SELECT 
  c.id as contact_id,
  c.company as company_name,
  true as is_primary,
  now() as created_at,
  now() as updated_at
FROM contacts c
WHERE c.company IS NOT NULL 
  AND c.company != ''
  AND c.source_table IN ('mandate_targets', 'leads')
  AND NOT EXISTS (
    SELECT 1 FROM contact_companies cc 
    WHERE cc.contact_id = c.id
  );

-- 7. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_contacts_contact_roles ON public.contacts USING GIN(contact_roles);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_status ON public.contacts(contact_status);
CREATE INDEX IF NOT EXISTS idx_contacts_source_table ON public.contacts(source_table);

-- 8. Actualizar trigger para manejar los nuevos campos
CREATE OR REPLACE FUNCTION public.log_contact_activity_unified()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  -- Handle INSERT (contact created)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'contact_created',
      'Contacto creado',
      'Se ha creado un nuevo contacto con roles: ' || array_to_string(NEW.contact_roles, ', '),
      jsonb_build_object(
        'contact_name', NEW.name,
        'contact_email', NEW.email,
        'contact_roles', NEW.contact_roles,
        'contact_status', NEW.contact_status,
        'source_table', NEW.source_table
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (contact modified) 
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      changes jsonb := '{}'::jsonb;
      change_description text := '';
    BEGIN
      -- Track role changes
      IF OLD.contact_roles != NEW.contact_roles THEN
        changes := changes || jsonb_build_object('roles', jsonb_build_object('from', OLD.contact_roles, 'to', NEW.contact_roles));
        change_description := change_description || 'Roles cambiados. ';
      END IF;
      
      -- Track status changes
      IF OLD.contact_status != NEW.contact_status THEN
        changes := changes || jsonb_build_object('status', jsonb_build_object('from', OLD.contact_status, 'to', NEW.contact_status));
        change_description := change_description || 'Estado cambiado. ';
      END IF;
      
      -- Only log if there are actual changes
      IF changes != '{}'::jsonb THEN
        INSERT INTO public.contact_activities (
          contact_id,
          activity_type,
          title,
          description,
          activity_data,
          created_by
        ) VALUES (
          NEW.id,
          'contact_updated',
          'Contacto actualizado',
          TRIM(change_description),
          jsonb_build_object(
            'changes', changes,
            'updated_by', auth.uid()
          ),
          auth.uid()
        );
      END IF;
    END;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Replace the old trigger
DROP TRIGGER IF EXISTS log_contact_activity_trigger ON public.contacts;
CREATE TRIGGER log_contact_activity_unified_trigger
  AFTER INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.log_contact_activity_unified();