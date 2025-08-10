-- Endurecimiento de public.leads y RLS completas
-- Justificación: asegurar integridad referencial mínima, defaults coherentes con frontend,
-- y políticas de acceso claras sin romper RLS existente. Script idempotente.

begin;

-- 0) Wrapper de permisos: respalda has_permission('leads.manage_all') si existe,
--    y en su defecto usa roles admin/superadmin mediante has_role_secure / has_role
create or replace function public.can_manage_all_leads()
returns boolean
language plpgsql
stable
security definer
set search_path to public
as $$
declare
  perm_exists boolean;
  has_role_secure_exists boolean;
  has_role_exists boolean;
begin
  select exists(
    select 1 from pg_proc where proname='has_permission' and pg_function_is_visible(oid)
  ) into perm_exists;
  if perm_exists then
    return has_permission('leads.manage_all');
  end if;

  select exists(
    select 1 from pg_proc where proname='has_role_secure' and pg_function_is_visible(oid)
  ) into has_role_secure_exists;
  select exists(
    select 1 from pg_proc where proname='has_role' and pg_function_is_visible(oid)
  ) into has_role_exists;

  if has_role_secure_exists then
    return coalesce(has_role_secure(auth.uid(), 'admin'::app_role), false)
        or coalesce(has_role_secure(auth.uid(), 'superadmin'::app_role), false);
  elsif has_role_exists then
    return coalesce(has_role(auth.uid(), 'admin'::app_role), false)
        or coalesce(has_role(auth.uid(), 'superadmin'::app_role), false);
  else
    return false;
  end if;
end;
$$;

-- 1) Reparar nulos existentes en created_by y assigned_to_id
--    Estrategia: usar existentes; si faltan, asignar a un superadmin/admin si existe
with superadmin as (
  select user_id as id
  from public.user_roles
  where role = 'superadmin'::app_role
  order by user_id
  limit 1
)
update public.leads l
set created_by = coalesce(l.created_by, l.assigned_to_id, (select id from superadmin))
where l.created_by is null;

with admin_or_sa as (
  select user_id as id
  from public.user_roles
  where role in ('admin'::app_role,'superadmin'::app_role)
  order by case role when 'superadmin' then 0 else 1 end, user_id
  limit 1
)
update public.leads l
set assigned_to_id = coalesce(l.assigned_to_id, l.created_by, (select id from admin_or_sa))
where l.assigned_to_id is null;

-- 2) Trigger de defaults (auth.uid()) + valores estáticos coherentes con frontend
create or replace function public.leads_set_defaults()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
declare
  default_stage uuid;
  col_exists int;
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  if new.assigned_to_id is null then
    new.assigned_to_id := auth.uid();
  end if;
  if new.lead_origin is null or btrim(new.lead_origin) = '' then
    new.lead_origin := 'manual';
  end if;
  if new.service_type is null or btrim(new.service_type) = '' then
    new.service_type := 'mandato_venta';
  end if;
  if new.status is null or btrim(new.status) = '' then
    new.status := 'NEW';
  end if;

  -- Default de stage (si existe columna)
  select count(*) into col_exists from information_schema.columns 
  where table_schema='public' and table_name='leads' and column_name='stage';
  if col_exists > 0 and (new.stage is null or btrim(new.stage) = '') then
    new.stage := 'pipeline';
  end if;

  -- Default de pipeline_stage_id (si existe tabla/columna y stage por defecto)
  select count(*) into col_exists from information_schema.columns 
  where table_schema='public' and table_name='leads' and column_name='pipeline_stage_id';
  if col_exists > 0 then
    begin
      select id into default_stage from public.pipeline_stages where is_default = true limit 1;
      if new.pipeline_stage_id is null then
        new.pipeline_stage_id := default_stage;
      end if;
    exception when others then
      -- ignorar si no existe tabla
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_set_defaults on public.leads;
create trigger trg_leads_set_defaults
before insert on public.leads
for each row execute function public.leads_set_defaults();

-- 3) Defaults estáticos a nivel de columna (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='leads' AND column_name='lead_origin'
  ) THEN
    EXECUTE 'ALTER TABLE public.leads ALTER COLUMN lead_origin SET DEFAULT ''manual''';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='leads' AND column_name='service_type'
  ) THEN
    EXECUTE 'ALTER TABLE public.leads ALTER COLUMN service_type SET DEFAULT ''mandato_venta''';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='leads' AND column_name='status'
  ) THEN
    EXECUTE 'ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT ''NEW''';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='leads' AND column_name='stage'
  ) THEN
    EXECUTE 'ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT ''pipeline''';
  END IF;
END $$;

-- 4) Forzar NOT NULL si ya no hay nulos (idempotente, no rompe datos históricos)
DO $$
DECLARE v_nulls int;
BEGIN
  SELECT count(*) INTO v_nulls FROM public.leads WHERE created_by IS NULL;
  IF v_nulls = 0 THEN
    BEGIN
      ALTER TABLE public.leads ALTER COLUMN created_by SET NOT NULL;
    EXCEPTION WHEN others THEN
      -- ignorar si no procede (por locks u otros)
    END;
  END IF;

  SELECT count(*) INTO v_nulls FROM public.leads WHERE assigned_to_id IS NULL;
  IF v_nulls = 0 THEN
    BEGIN
      ALTER TABLE public.leads ALTER COLUMN assigned_to_id SET NOT NULL;
    EXCEPTION WHEN others THEN
    END;
  END IF;
END $$;

-- 5) Índices para rendimiento de filtros comunes
create index if not exists idx_leads_created_by on public.leads(created_by);
create index if not exists idx_leads_assigned_to_id on public.leads(assigned_to_id);
create index if not exists idx_leads_status on public.leads(status);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='leads' AND column_name='pipeline_stage_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage_id ON public.leads(pipeline_stage_id)';
  END IF;
END $$;

-- 6) RLS: habilitar y políticas completas
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Limpiar nombres de políticas para idempotencia
DROP POLICY IF EXISTS users_view_own_leads ON public.leads;
DROP POLICY IF EXISTS admins_view_all_leads ON public.leads;
DROP POLICY IF EXISTS users_insert_own_leads ON public.leads;
DROP POLICY IF EXISTS users_update_own_or_assigned_leads ON public.leads;
DROP POLICY IF EXISTS users_delete_own_leads ON public.leads;

-- SELECT: propios (creador o asignado)
CREATE POLICY users_view_own_leads
ON public.leads FOR SELECT
USING (created_by = auth.uid() OR assigned_to_id = auth.uid());

-- SELECT: admins/permiso
CREATE POLICY admins_view_all_leads
ON public.leads FOR SELECT
USING (public.can_manage_all_leads());

-- INSERT: dueño/asignado a sí mismo o admins (defaults cubrirán nulos)
CREATE POLICY users_insert_own_leads
ON public.leads FOR INSERT
WITH CHECK (
  (created_by = auth.uid() OR created_by IS NULL)
  AND (assigned_to_id = auth.uid() OR assigned_to_id IS NULL)
  OR public.can_manage_all_leads()
);

-- UPDATE: creador, asignado o admins
CREATE POLICY users_update_own_or_assigned_leads
ON public.leads FOR UPDATE
USING (created_by = auth.uid() OR assigned_to_id = auth.uid() OR public.can_manage_all_leads())
WITH CHECK (created_by = auth.uid() OR assigned_to_id = auth.uid() OR public.can_manage_all_leads());

-- DELETE: creador o admins
CREATE POLICY users_delete_own_leads
ON public.leads FOR DELETE
USING (created_by = auth.uid() OR public.can_manage_all_leads());

-- 7) Trigger de control de reasignación: solo owner o admins pueden cambiar assigned_to_id
CREATE OR REPLACE FUNCTION public.enforce_lead_reassignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.assigned_to_id IS DISTINCT FROM OLD.assigned_to_id THEN
    IF NOT (public.can_manage_all_leads() OR OLD.created_by = auth.uid()) THEN
      RAISE EXCEPTION 'Solo el propietario del lead o administradores pueden reasignar leads';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_lead_reassignment ON public.leads;
CREATE TRIGGER trg_enforce_lead_reassignment
BEFORE UPDATE OF assigned_to_id ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.enforce_lead_reassignment();

-- 8) Validación (consultas informativas; seguras con RLS habilitado)
-- Conteo de nulos tras migración
-- SELECT count(*) AS null_created_by FROM public.leads WHERE created_by IS NULL;
-- SELECT count(*) AS null_assigned_to FROM public.leads WHERE assigned_to_id IS NULL;

-- Pruebas RLS con JWT simulado (ajustar UUIDs)
-- SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT user_id::text FROM public.user_roles LIMIT 1))::text, true);
-- SELECT count(*) FROM public.leads; -- debería devolver visibles para ese usuario
-- SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT user_id::text FROM public.user_roles WHERE role IN ('|| quote_literal('admin') ||'::app_role,'|| quote_literal('superadmin') ||'::app_role) LIMIT 1))::text, true);
-- SELECT count(*) FROM public.leads; -- admins ven todo

commit;

-- Plan de rollback (manual, si fuese necesario)
-- begin;
-- ALTER TABLE public.leads ALTER COLUMN created_by DROP NOT NULL;
-- ALTER TABLE public.leads ALTER COLUMN assigned_to_id DROP NOT NULL;
-- ALTER TABLE public.leads ALTER COLUMN lead_origin DROP DEFAULT;
-- ALTER TABLE public.leads ALTER COLUMN service_type DROP DEFAULT;
-- ALTER TABLE public.leads ALTER COLUMN status DROP DEFAULT;
-- ALTER TABLE public.leads ALTER COLUMN stage DROP DEFAULT;
-- DROP TRIGGER IF EXISTS trg_leads_set_defaults ON public.leads;
-- DROP FUNCTION IF EXISTS public.leads_set_defaults();
-- DROP TRIGGER IF EXISTS trg_enforce_lead_reassignment ON public.leads;
-- DROP FUNCTION IF EXISTS public.enforce_lead_reassignment();
-- DROP FUNCTION IF EXISTS public.can_manage_all_leads();
-- DROP INDEX IF EXISTS idx_leads_created_by;
-- DROP INDEX IF EXISTS idx_leads_assigned_to_id;
-- DROP INDEX IF EXISTS idx_leads_status;
-- DROP INDEX IF EXISTS idx_leads_pipeline_stage_id;
-- commit;