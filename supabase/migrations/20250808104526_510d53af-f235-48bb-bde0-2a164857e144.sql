-- Lead conversion RPC and link table
-- 1) Lead links table to relate leads with created entities
create table if not exists public.lead_links (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  entity_type text not null check (entity_type in ('sell','buy','valuation','mandate','valoracion')),
  entity_id uuid not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.lead_links enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_links' and policyname = 'Users can view own lead_links'
  ) then
    create policy "Users can view own lead_links"
      on public.lead_links
      for select
      using (created_by = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_links' and policyname = 'Users can insert own lead_links'
  ) then
    create policy "Users can insert own lead_links"
      on public.lead_links
      for insert
      with check (created_by = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_links' and policyname = 'Users can update own lead_links'
  ) then
    create policy "Users can update own lead_links"
      on public.lead_links
      for update
      using (created_by = auth.uid())
      with check (created_by = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_links' and policyname = 'Users can delete own lead_links'
  ) then
    create policy "Users can delete own lead_links"
      on public.lead_links
      for delete
      using (created_by = auth.uid());
  end if;
end $$;

create index if not exists idx_lead_links_lead on public.lead_links(lead_id);
create index if not exists idx_lead_links_entity on public.lead_links(entity_id);

-- 2) Atomic RPC to create entity from lead
create or replace function public.create_entity_from_lead(
  p_lead_id uuid,
  p_type text,
  p_payload jsonb,
  p_link boolean default true
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid := auth.uid();
  v_lead record;
  v_new_id uuid;
  v_type text := lower(coalesce(p_type,''));
  v_mandate_type text;
  v_client_name text;
  v_client_contact text;
  v_client_email text;
  v_client_phone text;
  v_company_name text;
  v_mandate_name text;
  v_target_sectors text[] := array[]::text[];
  v_target_locations text[] := array[]::text[];
  v_min_rev numeric;
  v_max_rev numeric;
  v_assigned uuid;
  v_sector text;
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  select * into v_lead from public.leads where id = p_lead_id;
  if not found then
    raise exception 'Lead no encontrado';
  end if;

  v_company_name := coalesce(btrim(p_payload->>'company_name'), btrim(v_lead.company), btrim(v_lead.company_name));
  v_client_name := coalesce(btrim(p_payload->>'client_name'), btrim(v_lead.name), btrim(v_lead.lead_name), 'Cliente');
  v_client_contact := coalesce(btrim(p_payload->>'client_contact'), v_client_name, 'Contacto');
  v_client_email := nullif(btrim(coalesce(p_payload->>'client_email', v_lead.email)), '');
  v_client_phone := nullif(btrim(coalesce(p_payload->>'client_phone', v_lead.phone)), '');
  v_assigned := coalesce((p_payload->>'assigned_user_id')::uuid, v_lead.assigned_to_id, v_lead.owner_id);
  v_sector := coalesce(btrim(p_payload->>'sector'), v_lead.industry, (v_lead.sector->>'nombre'));

  if p_payload ? 'target_sectors' then
    select coalesce(array_agg(value::text), array[]::text[]) into v_target_sectors
    from jsonb_array_elements_text(p_payload->'target_sectors');
  else
    v_target_sectors := case when v_sector is not null then array[v_sector] else array[]::text[] end;
  end if;

  if p_payload ? 'target_locations' then
    select coalesce(array_agg(value::text), array[]::text[]) into v_target_locations
    from jsonb_array_elements_text(p_payload->'target_locations');
  end if;

  if (p_payload->>'min_revenue') is not null then v_min_rev := (p_payload->>'min_revenue')::numeric; end if;
  if (p_payload->>'max_revenue') is not null then v_max_rev := (p_payload->>'max_revenue')::numeric; end if;

  if v_min_rev is null and coalesce(v_lead.deal_value, v_lead.valor_estimado) is not null then
    v_min_rev := round(coalesce(v_lead.deal_value, v_lead.valor_estimado) * 0.8);
  end if;
  if v_max_rev is null and coalesce(v_lead.deal_value, v_lead.valor_estimado) is not null then
    v_max_rev := round(coalesce(v_lead.deal_value, v_lead.valor_estimado) * 1.2);
  end if;

  if v_type in ('sell','buy') then
    v_mandate_type := case when v_type='sell' then 'venta' else 'compra' end;
    v_mandate_name := coalesce(btrim(p_payload->>'mandate_name'),
      (case when v_type='sell' then 'Mandato de Venta' else 'Mandato de Compra' end) || ' — ' || coalesce(v_company_name, v_client_name, 'Sin nombre'));

    insert into public.buying_mandates (
      client_name, client_contact, client_email, client_phone,
      mandate_name, target_sectors, target_locations,
      min_revenue, max_revenue, other_criteria,
      mandate_type, assigned_user_id, start_date, created_by
    ) values (
      v_client_name, v_client_contact, v_client_email, v_client_phone,
      v_mandate_name, coalesce(v_target_sectors, array[]::text[]), coalesce(v_target_locations, array[]::text[]),
      v_min_rev, v_max_rev, p_payload->>'notes',
      v_mandate_type, v_assigned, current_date, v_user
    )
    returning id into v_new_id;

  elsif v_type = 'valuation' then
    insert into public.valoraciones (
      company_name, client_name, client_email, company_sector, status, priority, company_description
    ) values (
      coalesce(v_company_name, 'Empresa sin nombre'),
      v_client_name,
      v_client_email,
      v_sector,
      coalesce(nullif(p_payload->>'status',''), 'requested'),
      coalesce(nullif(p_payload->>'priority',''), 'medium'),
      p_payload->>'notes'
    )
    returning id into v_new_id;
  else
    raise exception 'Tipo no soportado: %', v_type;
  end if;

  if p_link and v_new_id is not null then
    insert into public.lead_links (lead_id, entity_type, entity_id, created_by)
    values (p_lead_id, v_type, v_new_id, v_user);
  end if;

  -- Insert activity (best-effort)
  begin
    insert into public.lead_activities (lead_id, activity_type, activity_data, created_by)
    values (
      p_lead_id,
      'LEAD_CONVERTED',
      jsonb_build_object(
        'title', 'Lead convertido a '||v_type,
        'description', 'Lead convertido desde función',
        'entity_id', v_new_id,
        'entity_type', v_type
      ),
      v_user
    );
  exception when others then
    -- ignore activity errors
    null;
  end;

  -- Optional audit log (best-effort)
  begin
    perform public.log_security_event(
      'create_entity_from_lead','low','Lead convertido via RPC',
      jsonb_build_object('lead_id', p_lead_id, 'type', v_type, 'entity_id', v_new_id)
    );
  exception when others then null; end;

  return v_new_id;
exception
  when others then
    raise; -- Bubble up readable error
end;
$$;