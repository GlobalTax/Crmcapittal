-- 1) Tablas mínimas
create table if not exists public.lead_valuations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text,
  pdf_url text,
  company jsonb,
  result jsonb,
  tags jsonb
);

alter table public.lead_valuations enable row level security;

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_type text not null,
  full_name text,
  email text,
  phone text,
  company text,
  status text default 'new',
  source text default 'capittal_website',
  payload jsonb
);

alter table public.crm_leads enable row level security;

-- 2) Storage: bucket público para PDFs de valoraciones
insert into storage.buckets (id, name, public)
values ('valuations', 'valuations', true)
on conflict (id) do nothing;

-- 2.2) Política de lectura pública del bucket (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read valuations'
  ) THEN
    CREATE POLICY "Public read valuations"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'valuations');
  END IF;
END$$;