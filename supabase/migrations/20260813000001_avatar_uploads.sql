-- Avatars bucket + policies for user profile pictures
-- Run in the Supabase SQL Editor (one time only), e.g. https://supabase.com/dashboard/project/OWN_PROJECT_REF/sql/new

-- Public bucket so avatar URLs are served directly by Supabase CDN
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can read avatars (shown next to comments / profiles)
create policy if not exists "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users manage their avatar inside a folder named after their user id
create policy if not exists "Users can upload own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
