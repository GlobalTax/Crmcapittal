
-- 1) Tabla para controlar envíos desde formularios/landings/webhooks
create table if not exists public.lead_form_submissions (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  source text not null default 'form', -- ej: 'calculadora', 'landing', 'webhook', etc.
  -- Tracking/atribución
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  ip_address inet,
  user_agent text,

  -- Datos normalizados típicos del lead
  contact_name text,
  company_name text,
  cif text,
  email text,
  phone text,
  industry text,
  location text,
  employee_range text,
  years_of_operation int,
  revenue numeric,
  ebitda numeric,
  ownership_participation text,
  competitive_advantage text,

  -- Métricas de valoración (si aplica)
  final_valuation numeric,
  ebitda_multiple_used numeric,
  valuation_range_min numeric,
  valuation_range_max numeric,

  -- Idempotencia / correlación
  unique_token text,
  constraint lead_form_submissions_unique_token_uniq unique (unique_token),

  -- Payload bruto por si cambia el schema del origen
  raw_payload jsonb not null default '{}'::jsonb,

  -- Vinculación con lead creado en el proyecto principal (opcional)
  lead_id uuid null references public.leads(id) on delete set null,

  -- Estado de procesamiento/sincronización
  sync_status text not null default 'pending', -- pending | processed | error
  processed_at timestamptz,
  sync_error text,

  -- Auditoría básica
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices útiles
create index if not exists idx_lead_form_submissions_received_at on public.lead_form_submissions(received_at desc);
create index if not exists idx_lead_form_submissions_email on public.lead_form_submissions(email);
create index if not exists idx_lead_form_submissions_lead_id on public.lead_form_submissions(lead_id);
create index if not exists idx_lead_form_submissions_sync_status on public.lead_form_submissions(sync_status);
create index if not exists idx_lead_form_submissions_source on public.lead_form_submissions(source);

-- Trigger de updated_at (ya existe la función handle_updated_at en el proyecto)
drop trigger if exists trg_lead_form_submissions_updated_at on public.lead_form_submissions;
create trigger trg_lead_form_submissions_updated_at
before update on public.lead_form_submissions
for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.lead_form_submissions enable row level security;

-- Lectura: el creador puede ver sus filas; admins/superadmins pueden ver todo
drop policy if exists "lead_form_submissions_select_policy" on public.lead_form_submissions;
create policy "lead_form_submissions_select_policy"
on public.lead_form_submissions
for select
to authenticated
using (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Inserción: cualquier usuario autenticado puede registrar envíos (Edge Functions con service role ignoran RLS)
drop policy if exists "lead_form_submissions_insert_policy" on public.lead_form_submissions;
create policy "lead_form_submissions_insert_policy"
on public.lead_form_submissions
for insert
to authenticated
with check (true);

-- Actualización: el creador puede actualizar sus filas; admins/superadmins también (útil para marcar processed/error)
drop policy if exists "lead_form_submissions_update_policy" on public.lead_form_submissions;
create policy "lead_form_submissions_update_policy"
on public.lead_form_submissions
for update
to authenticated
using (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
)
with check (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Borrado: solo admins/superadmins
drop policy if exists "lead_form_submissions_delete_policy" on public.lead_form_submissions;
create policy "lead_form_submissions_delete_policy"
on public.lead_form_submissions
for delete
to authenticated
using (
  has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);


-- 2) Tabla simple de tags de lead para control/segmentación
create table if not exists public.lead_tags (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tag text not null,               -- ej: 'form', 'calculadora', 'landing-x', 'webhook', 'partner-xyz'
  source text not null default 'manual',
  created_by uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_lead_tags_lead_tag on public.lead_tags(lead_id, tag);
create index if not exists idx_lead_tags_tag on public.lead_tags(tag);

alter table public.lead_tags enable row level security;

-- Lectura: creador, admin o superadmin
drop policy if exists "lead_tags_select_policy" on public.lead_tags;
create policy "lead_tags_select_policy"
on public.lead_tags
for select
to authenticated
using (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Inserción: el creador (usuario autenticado) o admin/superadmin
drop policy if exists "lead_tags_insert_policy" on public.lead_tags;
create policy "lead_tags_insert_policy"
on public.lead_tags
for insert
to authenticated
with check (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Actualización: igual que inserción
drop policy if exists "lead_tags_update_policy" on public.lead_tags;
create policy "lead_tags_update_policy"
on public.lead_tags
for update
to authenticated
using (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
)
with check (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Borrado: creador o admin/superadmin
drop policy if exists "lead_tags_delete_policy" on public.lead_tags;
create policy "lead_tags_delete_policy"
on public.lead_tags
for delete
to authenticated
using (
  created_by = auth.uid()
  or has_role_secure(auth.uid(), 'admin'::app_role)
  or has_role_secure(auth.uid(), 'superadmin'::app_role)
);
