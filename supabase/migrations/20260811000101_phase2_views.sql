-- Ubuntu Essence — Phase 2: Article view counter
-- Run this in the Supabase SQL Editor. Idempotent, safe to run more than once.

-- 1. Add a view counter to articles
alter table public.articles
  add column if not exists views integer not null default 0;

-- 2. RPC: increment an article's view count.
--    security definer + anon grant so anonymous readers can call it
--    without write access to the articles table.
create or replace function public.increment_article_views(article_id integer)
returns void
language sql security definer
as $$
  update public.articles set views = views + 1 where id = article_id;
$$;

grant execute on function public.increment_article_views(integer) to anon, authenticated;

-- 3. Optional: backfill existing articles with a starting count
update public.articles set views = 0 where views is null;
