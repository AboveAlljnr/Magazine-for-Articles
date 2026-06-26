-- Run this in your Supabase Dashboard SQL Editor (one time only)
-- https://supabase.com/dashboard/project/jblkpydvwnuelbvxtxxu/sql/new

-- Allow admins (authenticated users with is_admin=true) to upload images
create policy if not exists "Admins can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to delete images
create policy if not exists "Admins can delete images"
  on storage.objects for delete
  using (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow public to read images (needed since the bucket is public)
create policy if not exists "Public can read images"
  on storage.objects for select
  using (bucket_id = 'article-images');
