-- Create private bucket for valuations
insert into storage.buckets (id, name, public)
values ('valuations', 'valuations', false)
on conflict (id) do nothing;

-- Policies for valuations bucket
-- Allow users to upload to folders prefixed with their user id
create policy if not exists "Users can upload their own valuations"
on storage.objects for insert
with check (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
create policy if not exists "Users can update their own valuations"
on storage.objects for update using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files (we'll use signed URLs too)
create policy if not exists "Users can view their own valuations"
on storage.objects for select using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: allow delete of own files
create policy if not exists "Users can delete their own valuations"
on storage.objects for delete using (
  bucket_id = 'valuations'
  and auth.uid()::text = (storage.foldername(name))[1]
);