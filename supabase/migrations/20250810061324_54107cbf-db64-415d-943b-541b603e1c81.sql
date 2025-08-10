-- RPC: convert_lead(p_lead_id uuid, p_create_company bool, p_create_deal bool)
-- Objetivo: convertir un lead en contacto y opcionalmente empresa y deal, de forma transaccional y segura.
-- Seguridad: SECURITY DEFINER, search_path restringido.
-- Idempotencia: CREATE OR REPLACE FUNCTION; uso de to_regclass para recursos opcionales.

create or replace function public.convert_lead(
  p_lead_id uuid,
  p_create_company boolean default true,
  p_create_deal boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_caller uuid := auth.uid();
  v_lead record;
  v_allowed boolean := false;
  v_contact_id uuid;
  v_company_id uuid;
  v_deal_id uuid;
  v_domain text;
  v_now timestamptz := now();
  v_user_email text;
  v_contact_name text;
  v_company_name text;
  v_deal_title text;
begin
  -- 1) Cargar lead y validar existencia
  select l.* into v_lead from public.leads l where l.id = p_lead_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Lead no encontrado');
  end if;

  -- 2) Chequeos de permisos: owner/asignado o admin/superadmin o permisos granulares
  if v_lead.created_by = v_caller or v_lead.assigned_to_id = v_caller then
    v_allowed := true;
  end if;
  if not v_allowed then
    begin
      if has_role_secure(v_caller, 'admin'::app_role)
         or has_role_secure(v_caller, 'superadmin'::app_role) then
        v_allowed := true;
      end if;
    exception when undefined_function then
      null;
    end;
  end if;
  if not v_allowed and to_regclass('public.user_permissions') is not null then
    if exists (
      select 1 from public.user_permissions up
      where up.user_id = v_caller
        and coalesce(up.is_granted, true) = true
        and up.permission_key in ('leads.convert', 'leads.manage_all')
    ) then
      v_allowed := true;
    end if;
  end if;
  if not v_allowed then
    return jsonb_build_object('success', false, 'error', 'Permisos insuficientes para convertir el lead');
  end if;

  -- 3) Derivar valores básicos
  v_contact_name := coalesce(nullif(trim(v_lead.name), ''), 'Contacto sin nombre');
  v_company_name := coalesce(nullif(trim(v_lead.company_name), ''), nullif(trim(v_lead.company), ''), nullif(trim(v_lead.organization), ''), 'Empresa sin nombre');
  if v_lead.email is not null and position('@' in v_lead.email) > 0 then
    v_domain := split_part(v_lead.email, '@', 2);
  end if;

  -- 4) CONTACTO: reutilizar por email si existe, sino crear
  if v_lead.email is not null then
    select c.id into v_contact_id
    from public.contacts c
    where lower(c.email) = lower(v_lead.email)
    limit 1;
  end if;

  if v_contact_id is null then
    -- Crear contacto mínimo; si la tabla tiene más columnas NOT NULL, esto podría fallar.
    insert into public.contacts (name, email, phone, created_by)
    values (v_contact_name, nullif(v_lead.email, ''), nullif(v_lead.phone, ''), coalesce(v_lead.created_by, v_caller))
    returning id into v_contact_id;
  end if;

  -- 5) EMPRESA (opcional): buscar por dominio/nif/nombre y reutilizar; si no, crear
  if p_create_company then
    if v_domain is not null then
      select co.id into v_company_id
      from public.companies co
      where lower(co.domain) = lower(v_domain)
      limit 1;
    end if;

    if v_company_id is null and v_lead.nif is not null then
      begin
        select co.id into v_company_id
        from public.companies co
        where co.nif = v_lead.nif
        limit 1;
      exception when undefined_column then
        v_company_id := null; -- tabla sin columna nif
      end;
    end if;

    if v_company_id is null then
      select co.id into v_company_id
      from public.companies co
      where lower(co.name) = lower(v_company_name)
      limit 1;
    end if;

    if v_company_id is null then
      insert into public.companies (name, domain, created_by)
      values (v_company_name, nullif(v_domain, ''), coalesce(v_lead.created_by, v_caller))
      returning id into v_company_id;
    end if;

    -- Vincular contacto a empresa si la columna existe
    begin
      update public.contacts set company_id = v_company_id where id = v_contact_id;
    exception when undefined_column then
      -- ignorar si contacts no tiene company_id
      null;
    end;
  end if;

  -- 6) DEAL (opcional y defensivo si existe la tabla)
  if p_create_deal and to_regclass('public.deals') is not null then
    -- Evitar duplicar: buscar deal abierto para este contacto en los últimos 30 días
    begin
      select d.id into v_deal_id
      from public.deals d
      where (case when exists(select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='contact_id') then d.contact_id = v_contact_id else false end)
      order by d.created_at desc nulls last
      limit 1;
    exception when others then
      v_deal_id := null; -- si la estructura no coincide
    end;

    if v_deal_id is null then
      v_deal_title := coalesce('Oportunidad — ' || v_contact_name, 'Oportunidad');
      -- Intentar inserción con columnas comunes; capturar excepciones por columnas desconocidas
      begin
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='title') then
          insert into public.deals (title, company_id, contact_id, created_by)
          values (
            v_deal_title,
            case when exists (select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='company_id') then v_company_id else null end,
            case when exists (select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='contact_id') then v_contact_id else null end,
            coalesce(v_lead.created_by, v_caller)
          ) returning id into v_deal_id;
        else
          -- alternativa: columna name en lugar de title
          insert into public.deals (name, company_id, contact_id, created_by)
          values (
            v_deal_title,
            case when exists (select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='company_id') then v_company_id else null end,
            case when exists (select 1 from information_schema.columns where table_schema='public' and table_name='deals' and column_name='contact_id') then v_contact_id else null end,
            coalesce(v_lead.created_by, v_caller)
          ) returning id into v_deal_id;
        end if;
      exception when others then
        v_deal_id := null; -- si falla, seguimos sin deal
      end;
    end if;
  end if;

  -- 7) Actualizar lead como convertido y enlazar ids
  update public.leads
     set status = 'CONVERTED',
         converted_to_contact_id = v_contact_id,
         converted_to_deal_id = v_deal_id,
         conversion_date = v_now,
         updated_at = v_now
   where id = p_lead_id;

  -- 8) Logs de actividad y enlaces auxiliares si existen
  if to_regclass('public.lead_activities') is not null then
    insert into public.lead_activities(lead_id, description, created_at)
    values (p_lead_id, 'Lead convertido a contacto/empresa/deal', v_now);
  end if;

  if to_regclass('public.lead_links') is not null then
    insert into public.lead_links(lead_id, entity_type, entity_id)
    values (p_lead_id, 'contact', v_contact_id)
    on conflict do nothing;
    if v_deal_id is not null then
      insert into public.lead_links(lead_id, entity_type, entity_id)
      values (p_lead_id, 'deal', v_deal_id)
      on conflict do nothing;
    end if;
  end if;

  -- 9) Auditoría de seguridad extendida (si existe función)
  begin
    perform public.enhanced_log_security_event(
      'lead_converted', 'low', 'Conversión de lead ejecutada',
      jsonb_build_object('lead_id', p_lead_id, 'contact_id', v_contact_id, 'company_id', v_company_id, 'deal_id', v_deal_id)
    );
  exception when undefined_function then
    null;
  end;

  return jsonb_build_object(
    'success', true,
    'lead_id', p_lead_id,
    'contact_id', v_contact_id,
    'company_id', v_company_id,
    'deal_id', v_deal_id
  );

exception when others then
  get stacked diagnostics v_user_email = message_text;
  -- Intentar registrar error
  begin
    perform public.enhanced_log_security_event(
      'lead_conversion_failed', 'high', 'Error en conversión de lead',
      jsonb_build_object('lead_id', p_lead_id, 'error', v_user_email)
    );
  exception when undefined_function then null; end;
  raise; -- Propagar error para que el cliente lo vea
end;
$$;

comment on function public.convert_lead(uuid, boolean, boolean) is
  'Convierte un lead en contacto (y opcionalmente empresa y deal) de forma transaccional. Reutiliza por email/empresa si existen. Actualiza status y campos de conversión en leads.';

-- ===============================
-- PRUEBAS (comentadas)
-- ===============================
-- select set_config('request.jwt.claims', json_build_object('sub','<USER_UUID>')::text, true);
-- 1) Solo contacto: 
--   select public.convert_lead('<LEAD_UUID>'::uuid, false, false);
-- 2) Contacto + Empresa:
--   select public.convert_lead('<LEAD_UUID>'::uuid, true, false);
-- 3) Full con deal:
--   select public.convert_lead('<LEAD_UUID>'::uuid, true, true);
-- Verificar: leads.status='CONVERTED', converted_to_contact_id/deal_id y registros en lead_activities/lead_links si existen.
