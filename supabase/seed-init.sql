-- Run this in Supabase Dashboard → SQL Editor first.
-- Then I'll run the seed script from the CLI.

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url  text,
  bio         text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Authors
create table if not exists public.authors (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  bio         text not null default '',
  avatar_url  text,
  created_at  timestamptz not null default now()
);
alter table public.authors enable row level security;
create policy "Authors are publicly readable" on public.authors for select using (true);
create policy "Authors insert (service role)" on public.authors for insert with check (true);
create policy "Authors update (service role)" on public.authors for update using (true);

-- 4. Categories
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories are publicly readable" on public.categories for select using (true);
create policy "Categories insert (service role)" on public.categories for insert with check (true);
create policy "Categories update (service role)" on public.categories for update using (true);

-- 5. Subcategories
create table if not exists public.subcategories (
  id           serial primary key,
  name         text not null,
  slug         text not null,
  category_id  integer not null references public.categories(id) on delete cascade,
  description  text not null default '',
  created_at   timestamptz not null default now(),
  unique(slug, category_id)
);
alter table public.subcategories enable row level security;
create policy "Subcategories are publicly readable" on public.subcategories for select using (true);
create policy "Subcategories insert (service role)" on public.subcategories for insert with check (true);
create policy "Subcategories update (service role)" on public.subcategories for update using (true);

-- 6. Articles
create table if not exists public.articles (
  id                serial primary key,
  title             text not null,
  slug              text not null unique,
  excerpt           text not null default '',
  body              text[] not null default '{}',
  category_id       integer not null references public.categories(id) on delete restrict,
  subcategory_id    integer references public.subcategories(id) on delete set null,
  author_id         integer not null references public.authors(id) on delete restrict,
  image_url         text not null default '',
  read_time_minutes integer not null default 5,
  published         boolean not null default false,
  featured          boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_articles_published on public.articles(published);
create index idx_articles_featured on public.articles(featured) where featured = true;
create index idx_articles_category on public.articles(category_id);
create index idx_articles_author on public.articles(author_id);
create index idx_articles_published_at on public.articles(published_at desc);
alter table public.articles enable row level security;
create policy "Articles are publicly readable if published" on public.articles for select using (published = true);
create policy "Articles read all (service role)" on public.articles for select using (true);
create policy "Articles insert (service role)" on public.articles for insert with check (true);
create policy "Articles update (service role)" on public.articles for update using (true);

-- 7. Bookmarks
create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  article_id integer not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.bookmarks enable row level security;
create policy "Users can read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- 8. Comments
create table if not exists public.comments (
  id          serial primary key,
  article_id  integer not null references public.articles(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  likes_count integer not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_comments_article on public.comments(article_id);
alter table public.comments enable row level security;
create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- 9. Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id         serial primary key,
  email      text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Admins can read subscribers" on public.newsletter_subscribers for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- 10. RPC: increment comment likes
create or replace function public.increment_comment_likes(comment_id integer)
returns void as $$
  update public.comments set likes_count = likes_count + 1 where id = comment_id;
$$ language sql security definer;
