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

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` — used server-side by the newsletter function. Never expose this in `VITE_`-prefixed variables.

### Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor to create the required tables.

For Google sign-in: Supabase Dashboard → Authentication → URL Configuration, set the Site URL to your deployed domain, and add it to the list of Redirect URLs (e.g. `https://your-domain.vercel.app/**`).
