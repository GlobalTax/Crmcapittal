-- Create valuation_events table for analytics of the public valuation flow
create extension if not exists pgcrypto;

create table if not exists public.valuation_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,
  event_name text not null,
  step integer,
  payload jsonb,
  user_agent text,
  ip_address inet
);

-- Enable RLS
alter table public.valuation_events enable row level security;

-- Policy: allow anyone (including anon) to insert events
create policy "Public can insert valuation events"
  on public.valuation_events
  for insert
  to public
  with check (true);

-- Restrict select to authenticated users only
create policy "Authenticated can select valuation events"
  on public.valuation_events
  for select
  to authenticated
  using (true);

-- Helpful indexes
create index if not exists idx_valuation_events_created_at on public.valuation_events(created_at desc);
create index if not exists idx_valuation_events_name on public.valuation_events(event_name);
