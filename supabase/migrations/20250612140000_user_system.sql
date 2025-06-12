
-- Create user profiles table
create table public.user_profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  company text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- Create user favorite operations table
create table public.user_favorite_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  operation_id uuid not null references public.operations on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique (user_id, operation_id)
);

-- Enable RLS on both tables
alter table public.user_profiles enable row level security;
alter table public.user_favorite_operations enable row level security;

-- Policies for user_profiles
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Policies for user_favorite_operations
create policy "Users can view own favorites"
  on public.user_favorite_operations for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.user_favorite_operations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.user_favorite_operations for delete
  using (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger for user_profiles updated_at
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
