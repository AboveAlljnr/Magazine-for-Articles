-- Ubuntu Essence — Phase 2: Nested comment replies
-- Run this in the Supabase SQL Editor. Idempotent, safe to run more than once.

-- 1. Add a self-referential parent column to comments
alter table public.comments
  add column if not exists parent_id integer references public.comments(id) on delete cascade;

-- 2. Index for efficient reply lookups
create index if not exists idx_comments_parent on public.comments(parent_id);

-- Replies are covered by the existing insert policy
-- ("Authenticated users can insert comments" with auth.uid() = user_id);
-- the foreign key guarantees parent_id always points at a real comment.
