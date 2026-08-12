-- Phase 5: comment moderation
-- status: approved | hidden (moderated away, not deleted)
alter table public.comments
  add column if not exists status text not null default 'approved',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_comments_status on public.comments (status);

-- Public list shows only approved comments
drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable (approved only)"
  on public.comments for select to public
  using (status = 'approved');

-- Admins can see everything, including hidden
drop policy if exists "Admins can view all comments" on public.comments;
create policy "Admins can view all comments"
  on public.comments for select to public
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- Admins can hide/show any comment
drop policy if exists "Admins can moderate comments" on public.comments;
create policy "Admins can moderate comments"
  on public.comments for update to public
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- Admins can delete any comment
drop policy if exists "Admins can delete comments" on public.comments;
create policy "Admins can delete comments"
  on public.comments for delete to public
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- Count only approved comments (and react to moderation status changes)
create or replace function public.maintain_article_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'approved' then
      update public.articles set comments_count = comments_count + 1 where id = new.article_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.status = 'approved' then
      update public.articles set comments_count = greatest(comments_count - 1, 0) where id = old.article_id;
    end if;
    return old;
  elsif tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      if new.status = 'approved' then
        update public.articles set comments_count = comments_count + 1 where id = new.article_id;
      elsif old.status = 'approved' then
        update public.articles set comments_count = greatest(comments_count - 1, 0) where id = new.article_id;
      end if;
    end if;
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_comments_maintain_count on public.comments;
create trigger trg_comments_maintain_count
  after insert or delete or update on public.comments
  for each row execute function public.maintain_article_comments_count();

-- Re-backfill to approved-only counts (idempotent)
update public.articles a
  set comments_count = (
    select count(*) from public.comments c
    where c.article_id = a.id and c.status = 'approved'
  );
