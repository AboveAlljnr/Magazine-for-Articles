# Magazine for Articles

A digital magazine for Ubuntu Essence — celebrating African culture, heritage, fashion, arts, travel, and lifestyle.

## Running the code

```sh
npm i       # install dependencies
npm run dev # start the development server
npm run build # production build
```

## Environment variables

Create a `.env` file in the project root with the following variables:

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | e.g. `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | Public anon key, safe to expose |

### Vercel deployment

Set the following Environment Variables in Vercel (Project → Settings → Environment Variables):

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | Used by both the client and serverless functions |
| `VITE_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. From Supabase → Project Settings → API → service_role. Used by the newsletter function to read subscribers. |
| `RESEND_API_KEY` | From https://resend.com/api-keys. Used by the newsletter function. |
| `SITE_URL` | Your deployed domain, e.g. `https://ubuntu-essence.vercel.app`. Used for RSS links and newsletter links. |

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in `VITE_`-prefixed variables — they would leak into the browser bundle.

### Serverless functions

- `api/feed.xml.ts` — generates the RSS feed at `/feed.xml` (also aliased via `vercel.json`).
- `api/send-newsletter.ts` — sends a newsletter to all subscribers. Only a signed-in admin can trigger it. Called from Admin → Subscribers → "Send newsletter".

Note: Resend's default `onboarding@resend.dev` sender only delivers to the account owner's email. To send to all subscribers, verify a domain in Resend (Add a domain → DNS records) and update the `from` address in `api/send-newsletter.ts`.

### Supabase setup

Run the SQL files in the Supabase SQL Editor (Dashboard → SQL Editor), in this order:

1. `supabase/schema.sql` — core tables (profiles, authors, categories, subcategories, articles, bookmarks, comments, newsletter_subscribers) + seed data.
2. `supabase/migrations/` — every migration in filename order (`20260811000101` → `20260812000003`). These add views, article likes, full-text search, notes, comment replies, newsletter RPCs, and comment moderation.
3. `supabase/article-images.sql` — article image gallery table.
4. `supabase/storage-policies.sql` — storage policies for the `article-images` bucket (used by the admin gallery upload).
5. `supabase/migrations/20260813000001_avatar_uploads.sql` — creates the public `avatars` bucket used by the profile photo uploader.

> Tip: the numbered migrations are also runnable via the Supabase CLI (`supabase db push`) if you prefer a git-tracked workflow.

For Google sign-in: Supabase Dashboard → Authentication → URL Configuration, set the Site URL to your deployed domain, and add it to the list of Redirect URLs (e.g. `https://your-domain.vercel.app/**`).
