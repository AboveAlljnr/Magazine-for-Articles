-- Phase 4: newsletter hardening
-- 1. status + opt-in columns, updated_at tracker
alter table public.newsletter_subscribers
  add column if not exists status text not null default 'active',
  add column if not exists opt_in_token text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_newsletter_subscribers_status on public.newsletter_subscribers (status);

-- 2. Replace open table INSERTs with a cooldown-aware subscribe RPC.
--    New signups land as 'active' (double opt-in is dormant until a send
--    domain is verified; confirm_subscription() is the dormant companion).
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;

create or replace function public.subscribe_to_newsletter(p_email text)
returns table (email text, status text, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_row public.newsletter_subscribers%rowtype;
begin
  v_email := lower(btrim(p_email));
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = 'P0001';
  end if;

  select r.* into v_row from public.newsletter_subscribers r where r.email = v_email;

  if v_row.id is not null then
    if v_row.status = 'unsubscribed' then
      if now() - v_row.updated_at < interval '60 seconds' then
        raise exception 'cooldown: try again shortly' using errcode = 'P0001';
      end if;
      update public.newsletter_subscribers r
        set status = 'active', updated_at = now()
        where r.email = v_email;
      return query select v_email, 'active', 're-subscribed';
      return;
    end if;
    return query select v_email, v_row.status, 'already subscribed';
    return;
  end if;

  insert into public.newsletter_subscribers (email, status)
  values (v_email, 'active');
  return query select v_email, 'active', 'subscribed';
end;
$$;

revoke all on function public.subscribe_to_newsletter(text) from public;
grant execute on function public.subscribe_to_newsletter(text) to anon, authenticated;

-- 3. Dormant double opt-in confirmation. Wired up once a Resend domain is
--    verified; until then new subscribers are immediately active.
create or replace function public.confirm_subscription(p_token text)
returns table (email text, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select r.email into v_email
  from public.newsletter_subscribers r
  where r.opt_in_token = p_token and r.status = 'pending';

  if v_email is null then
    raise exception 'invalid token' using errcode = 'P0001';
  end if;

  update public.newsletter_subscribers r
    set status = 'active', confirmed_at = now(), opt_in_token = null
    where r.email = v_email;

  return query select v_email, 'active';
end;
$$;

revoke all on function public.confirm_subscription(text) from public;
grant execute on function public.confirm_subscription(text) to anon, authenticated;
