-- Run in Supabase SQL Editor
create table if not exists public.article_images (
  id          serial primary key,
  article_id  integer not null references public.articles(id) on delete cascade,
  image_url   text not null,
  caption     text not null default '',
  alt_text    text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.article_images enable row level security;

create policy "Article images are publicly readable"
  on public.article_images for select using (true);

create policy "Admins can insert article images"
  on public.article_images for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update article images"
  on public.article_images for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete article images"
  on public.article_images for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
