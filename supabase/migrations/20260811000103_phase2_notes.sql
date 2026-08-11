-- Ubuntu Essence — Phase 2: Notes
-- Short magazine notes / thoughts, optionally with a YouTube or Vimeo video embed.
-- Run this in the Supabase SQL Editor. Idempotent, safe to run more than once.

create table if not exists public.notes (
  id         serial primary key,
  body       text not null default '',
  video_url  text,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Notes are publicly readable"
  on public.notes for select using (true);

create policy "Admins can insert notes"
  on public.notes for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update notes"
  on public.notes for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete notes"
  on public.notes for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
