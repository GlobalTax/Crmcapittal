-- 1) Catálogo de taxonomía (dimensiones y valores)
-- Evitar duplicados, RLS segura para admins, y timestamps

-- Extensiones necesarias (generalmente ya disponibles en Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Dimensiones
CREATE TABLE IF NOT EXISTS public.taxonomy_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, -- p.ej.: 'company.industry', 'contact.classification'
  name text NOT NULL,
  description text,
  entity_scope text NOT NULL DEFAULT 'both', -- 'company' | 'contact' | 'both'
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Valores
CREATE TABLE IF NOT EXISTS public.taxonomy_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_id uuid NOT NULL REFERENCES public.taxonomy_dimensions(id) ON DELETE CASCADE,
  value text NOT NULL,  -- clave controlada p.ej. 'software', 'food_and_beverage'
  label text NOT NULL,  -- etiqueta legible p.ej. 'Software', 'Alimentación & Bebidas'
  parent_id uuid REFERENCES public.taxonomy_values(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dimension_id, value)
);

-- RLS
ALTER TABLE public.taxonomy_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_values ENABLE ROW LEVEL SECURITY;

-- Policies: lectura para todos los autenticados; gestión solo admins/superadmins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='taxonomy_dimensions' AND policyname='users_select_taxonomy_dimensions'
  ) THEN
    CREATE POLICY users_select_taxonomy_dimensions ON public.taxonomy_dimensions
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='taxonomy_dimensions' AND policyname='admins_manage_taxonomy_dimensions'
  ) THEN
    CREATE POLICY admins_manage_taxonomy_dimensions ON public.taxonomy_dimensions
      FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='taxonomy_values' AND policyname='users_select_taxonomy_values'
  ) THEN
    CREATE POLICY users_select_taxonomy_values ON public.taxonomy_values
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='taxonomy_values' AND policyname='admins_manage_taxonomy_values'
  ) THEN
    CREATE POLICY admins_manage_taxonomy_values ON public.taxonomy_values
      FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
  END IF;
END $$;

-- Trigger de updated_at (reutilizamos handle_updated_at si existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_taxonomy_dimensions_updated_at'
  ) THEN
    CREATE TRIGGER tg_taxonomy_dimensions_updated_at
    BEFORE UPDATE ON public.taxonomy_dimensions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_taxonomy_values_updated_at'
  ) THEN
    CREATE TRIGGER tg_taxonomy_values_updated_at
    BEFORE UPDATE ON public.taxonomy_values
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_tax_dim_key ON public.taxonomy_dimensions(key);
CREATE INDEX IF NOT EXISTS idx_tax_val_dimension ON public.taxonomy_values(dimension_id);
CREATE INDEX IF NOT EXISTS idx_tax_val_value ON public.taxonomy_values(value);


-- 2) Nuevos campos controlados en companies (sin romper legacy)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS industry_tax text,
  ADD COLUMN IF NOT EXISTS subindustry_tax text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS revenue_band text,
  ADD COLUMN IF NOT EXISTS employees_band text,
  ADD COLUMN IF NOT EXISTS ebitda_band text,
  ADD COLUMN IF NOT EXISTS margin_band text,
  ADD COLUMN IF NOT EXISTS leverage_band text,
  ADD COLUMN IF NOT EXISTS seller_ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buyer_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS investor_type text,
  ADD COLUMN IF NOT EXISTS strategic_fit text,
  ADD COLUMN IF NOT EXISTS prefers_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prefers_phone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prefers_whatsapp boolean NOT NULL DEFAULT false;

-- Índices útiles (consulta frecuente)
CREATE INDEX IF NOT EXISTS idx_companies_industry_tax ON public.companies(industry_tax);
CREATE INDEX IF NOT EXISTS idx_companies_subindustry_tax ON public.companies(subindustry_tax);
CREATE INDEX IF NOT EXISTS idx_companies_country_code ON public.companies(country_code);
CREATE INDEX IF NOT EXISTS idx_companies_revenue_band ON public.companies(revenue_band);
CREATE INDEX IF NOT EXISTS idx_companies_employees_band ON public.companies(employees_band);
CREATE INDEX IF NOT EXISTS idx_companies_ebitda_band ON public.companies(ebitda_band);
CREATE INDEX IF NOT EXISTS idx_companies_margin_band ON public.companies(margin_band);
CREATE INDEX IF NOT EXISTS idx_companies_leverage_band ON public.companies(leverage_band);
CREATE INDEX IF NOT EXISTS idx_companies_investor_type ON public.companies(investor_type);
CREATE INDEX IF NOT EXISTS idx_companies_strategic_fit ON public.companies(strategic_fit);


-- 3) Nuevos campos controlados en contacts (reutilizando language/time_zone existentes)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS classification text,
  ADD COLUMN IF NOT EXISTS role_simple text,
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS ticket_min numeric,
  ADD COLUMN IF NOT EXISTS ticket_max numeric,
  ADD COLUMN IF NOT EXISTS geography_focus text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sectors_focus text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS channel_pref text,
  ADD COLUMN IF NOT EXISTS consent_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_whatsapp boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_contacts_classification ON public.contacts(classification);
CREATE INDEX IF NOT EXISTS idx_contacts_role_simple ON public.contacts(role_simple);
CREATE INDEX IF NOT EXISTS idx_contacts_interest ON public.contacts(interest);
CREATE INDEX IF NOT EXISTS idx_contacts_ticket_min ON public.contacts(ticket_min);
CREATE INDEX IF NOT EXISTS idx_contacts_ticket_max ON public.contacts(ticket_max);
CREATE INDEX IF NOT EXISTS idx_contacts_channel_pref ON public.contacts(channel_pref);
CREATE INDEX IF NOT EXISTS idx_contacts_geography_focus_gin ON public.contacts USING GIN(geography_focus);
CREATE INDEX IF NOT EXISTS idx_contacts_sectors_focus_gin ON public.contacts USING GIN(sectors_focus);


-- 4) Funciones de validación suaves (solo validan si hay catálogo cargado)
CREATE OR REPLACE FUNCTION public.validate_taxonomy_single(p_dimension_key text, p_value text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_catalog boolean;
  is_valid boolean;
BEGIN
  IF p_value IS NULL OR btrim(p_value) = '' THEN
    RETURN true; -- valores nulos/blank permitidos
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM taxonomy_dimensions d
    JOIN taxonomy_values v ON v.dimension_id = d.id AND v.is_active = true
    WHERE d.key = p_dimension_key AND d.is_active = true
  ) INTO has_catalog;

  IF NOT has_catalog THEN
    RETURN true; -- sin catálogo cargado, no forzar
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM taxonomy_dimensions d
    JOIN taxonomy_values v ON v.dimension_id = d.id AND v.is_active = true
    WHERE d.key = p_dimension_key AND d.is_active = true AND v.value = p_value
  ) INTO is_valid;

  RETURN COALESCE(is_valid, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_taxonomy_array(p_dimension_key text, p_values text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_catalog boolean;
  invalid_count integer;
BEGIN
  IF p_values IS NULL OR array_length(p_values, 1) IS NULL THEN
    RETURN true; -- vacío permitido
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM taxonomy_dimensions d
    JOIN taxonomy_values v ON v.dimension_id = d.id AND v.is_active = true
    WHERE d.key = p_dimension_key AND d.is_active = true
  ) INTO has_catalog;

  IF NOT has_catalog THEN
    RETURN true;
  END IF;

  SELECT COUNT(*) INTO invalid_count
  FROM unnest(p_values) AS x(val)
  WHERE NOT EXISTS (
    SELECT 1 FROM taxonomy_dimensions d
    JOIN taxonomy_values v ON v.dimension_id = d.id AND v.is_active = true
    WHERE d.key = p_dimension_key AND d.is_active = true AND v.value = x.val
  );

  RETURN invalid_count = 0;
END;
$$;


-- 5) Triggers de validación en companies
CREATE OR REPLACE FUNCTION public.trg_validate_company_taxonomy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.validate_taxonomy_single('company.industry', NEW.industry_tax) THEN
    RAISE EXCEPTION 'Valor inválido para industry_tax: %', NEW.industry_tax;
  END IF;
  IF NOT public.validate_taxonomy_single('company.subindustry', NEW.subindustry_tax) THEN
    RAISE EXCEPTION 'Valor inválido para subindustry_tax: %', NEW.subindustry_tax;
  END IF;
  IF NOT public.validate_taxonomy_single('company.revenue_band', NEW.revenue_band) THEN
    RAISE EXCEPTION 'Valor inválido para revenue_band: %', NEW.revenue_band;
  END IF;
  IF NOT public.validate_taxonomy_single('company.employees_band', NEW.employees_band) THEN
    RAISE EXCEPTION 'Valor inválido para employees_band: %', NEW.employees_band;
  END IF;
  IF NOT public.validate_taxonomy_single('company.ebitda_band', NEW.ebitda_band) THEN
    RAISE EXCEPTION 'Valor inválido para ebitda_band: %', NEW.ebitda_band;
  END IF;
  IF NOT public.validate_taxonomy_single('company.margin_band', NEW.margin_band) THEN
    RAISE EXCEPTION 'Valor inválido para margin_band: %', NEW.margin_band;
  END IF;
  IF NOT public.validate_taxonomy_single('company.leverage_band', NEW.leverage_band) THEN
    RAISE EXCEPTION 'Valor inválido para leverage_band: %', NEW.leverage_band;
  END IF;
  IF NOT public.validate_taxonomy_single('company.investor_type', NEW.investor_type) THEN
    RAISE EXCEPTION 'Valor inválido para investor_type: %', NEW.investor_type;
  END IF;
  IF NOT public.validate_taxonomy_single('company.strategic_fit', NEW.strategic_fit) THEN
    RAISE EXCEPTION 'Valor inválido para strategic_fit: %', NEW.strategic_fit;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_validate_company_taxonomy_biu'
  ) THEN
    CREATE TRIGGER tg_validate_company_taxonomy_biu
    BEFORE INSERT OR UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.trg_validate_company_taxonomy();
  END IF;
END $$;


-- 6) Triggers de validación en contacts
CREATE OR REPLACE FUNCTION public.trg_validate_contact_taxonomy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.validate_taxonomy_single('contact.classification', NEW.classification) THEN
    RAISE EXCEPTION 'Valor inválido para classification: %', NEW.classification;
  END IF;
  IF NOT public.validate_taxonomy_single('contact.role_simple', NEW.role_simple) THEN
    RAISE EXCEPTION 'Valor inválido para role_simple: %', NEW.role_simple;
  END IF;
  IF NOT public.validate_taxonomy_single('contact.interest', NEW.interest) THEN
    RAISE EXCEPTION 'Valor inválido para interest: %', NEW.interest;
  END IF;
  IF NOT public.validate_taxonomy_single('contact.channel_pref', NEW.channel_pref) THEN
    RAISE EXCEPTION 'Valor inválido para channel_pref: %', NEW.channel_pref;
  END IF;
  IF NOT public.validate_taxonomy_array('contact.geography_focus', NEW.geography_focus) THEN
    RAISE EXCEPTION 'Valor inválido en geography_focus';
  END IF;
  IF NOT public.validate_taxonomy_array('contact.sectors_focus', NEW.sectors_focus) THEN
    RAISE EXCEPTION 'Valor inválido en sectors_focus';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_validate_contact_taxonomy_biu'
  ) THEN
    CREATE TRIGGER tg_validate_contact_taxonomy_biu
    BEFORE INSERT OR UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.trg_validate_contact_taxonomy();
  END IF;
END $$;
