-- Create private bucket for valuations
insert into storage.buckets (id, name, public)
values ('valuations', 'valuations', false)
on conflict (id) do nothing;

-- Drop old policies if exist (to be idempotent)
drop policy if exists "valuations_insert_own" on storage.objects;
drop policy if exists "valuations_update_own" on storage.objects;
drop policy if exists "valuations_select_own" on storage.objects;
drop policy if exists "valuations_delete_own" on storage.objects;

-- Allow users to upload to folders prefixed with their user id
create policy "valuations_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
create policy "valuations_update_own"
on storage.objects for update using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files (we'll use signed URLs too)
create policy "valuations_select_own"
on storage.objects for select using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
create policy "valuations_delete_own"
on storage.objects for delete using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);