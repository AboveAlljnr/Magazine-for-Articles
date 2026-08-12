-- Phase 3: content & engagement
-- article comment counts, like counts + RPC, full-text search column

-- 1. Comment count column + backfill
alter table public.articles
  add column if not exists comments_count integer not null default 0;

update public.articles a
  set comments_count = (
    select count(*) from public.comments c where c.article_id = a.id
  );

-- 2. Keep comment counts in sync
create or replace function public.maintain_article_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.articles set comments_count = comments_count + 1 where id = new.article_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.articles set comments_count = greatest(comments_count - 1, 0) where id = old.article_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_comments_maintain_count on public.comments;
create trigger trg_comments_maintain_count
  after insert or delete on public.comments
  for each row execute function public.maintain_article_comments_count();

-- 3. Article likes
alter table public.articles
  add column if not exists likes_count integer not null default 0;

create or replace function public.increment_article_likes(article_id integer)
returns void as $$
  update public.articles set likes_count = likes_count + 1 where id = article_id;
$$ language sql security definer;

grant execute on function public.increment_article_likes to anon, authenticated;

-- 4. Full-text search over title, excerpt and body
-- to_tsvector and array_to_string are STABLE in this Postgres version, so
-- wrap them to satisfy the generated-column immutability requirement.
create or replace function public.immutable_tsvector(value text)
returns tsvector language sql immutable as $$
  select to_tsvector('english', coalesce(value, ''));
$$;

create or replace function public.immutable_array_to_string(value text[], delimiter text)
returns text language sql immutable as $$
  select array_to_string(value, delimiter);
$$;

alter table public.articles
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(public.immutable_tsvector(title), 'A') ||
    setweight(public.immutable_tsvector(excerpt), 'B') ||
    setweight(public.immutable_tsvector(public.immutable_array_to_string(body, ' ')), 'C')
  ) stored;

create index if not exists idx_articles_search_tsv on public.articles using gin (search_tsv);
