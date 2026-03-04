# CollectorConnector (Clean Next.js 14 Starter)

This is a clean Next.js App Router project with a working `/create-profile` form
that writes to a Supabase `profiles` table.

## Quick Start
1. Add environment variables in Vercel (Project → Settings → Environment Variables):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Deploy on Vercel.

3. Visit `/create-profile` to test profile creation.

## Supabase Table
Create a `profiles` table with at least these columns:

- `id` (uuid, default: `uuid_generate_v4()`, primary key)
- `username` (text)
- `bio` (text)
- `instagram` (text)
- `twitter` (text)
- `youtube` (text)
- `avatar_url` (text)
- `tier` (text)

> Tip: Enable Row Level Security and start with a simple `INSERT` policy for anonymous users while testing.
