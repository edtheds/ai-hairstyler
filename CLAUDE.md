@AGENTS.md

# Hairstyler — AI Styling App

Upload a photo, choose a hairstyle via text/catalog/sliders/reference photo, generate a face-preserving styled image via Replicate, save to named collections, and compare variants side-by-side.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** — Auth, Postgres, Storage
- **Replicate API** — AI generation (`flux-kontext-apps/change-haircut`)
- **shadcn/ui** + Tailwind CSS v4
- **Vercel** — deployment

## Key commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run typecheck    # tsc --noEmit

# Supabase
npx supabase start          # start local Supabase
npx supabase db push        # push migrations to remote
npx supabase gen types typescript --local > types/database.types.ts
npx supabase db reset       # reset local DB + run seed
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server only, bypasses RLS)
REPLICATE_API_TOKEN=             # Replicate API token
REPLICATE_WEBHOOK_SIGNING_SECRET= # from: curl -H "Authorization: Bearer $REPLICATE_API_TOKEN" https://api.replicate.com/v1/webhooks/default/secret
NEXT_PUBLIC_APP_URL=             # full URL incl. scheme (http://localhost:3000 or https://...)
```

## Architecture decisions

- **Replicate: webhooks, not polling.** `/api/generate` returns `generation_id` immediately. Replicate POSTs to `/api/webhooks/replicate` on completion. Frontend polls the Supabase `generations` row for status. Keeps serverless functions short-lived.
- **Image uploads: signed URL pattern.** Server action generates a signed upload URL; client PUTs directly to Supabase Storage. Bypasses Next.js body size limits. Storage path (not Replicate delivery URL) is stored — delivery URLs expire in ~1h.
- **Style catalog: TypeScript source + Postgres seed.** `lib/catalog/styles.ts` is the source of truth; `supabase/seed/001_styles.sql` upserts from it on `db reset`.
- **Comparison view: DB-backed.** One `comparison_sessions` row per user with `pinned_image_ids uuid[]` (max 4). Survives page refresh.
- **AI model: `flux-kontext-apps/change-haircut`** for text/catalog/sliders. `cjwbw/style-your-hair` for reference photo transfer (warn: ~22 min). Abstracted behind `lib/replicate/models.ts`.

## Conventions

- No logic in `app/` pages — they compose components and call server actions/fetch
- Replicate API only called server-side (never from the browser — key exposure risk)
- Three Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components/actions), `lib/supabase/admin.ts` (service role, webhook only)
- Use `getClaims()` not `getSession()` on the server — `getSession()` does not revalidate JWT
- After every schema migration: `npx supabase gen types typescript --local > types/database.types.ts`
- Never edit existing migrations — always add a new file

## Supabase Dashboard setup (manual)

1. Enable Google OAuth: Authentication → Providers → Google (Client ID + Secret from Google Cloud Console)
2. Enable Apple OAuth: Authentication → Providers → Apple (Service ID, Team ID, Key ID, Private Key — requires paid Apple Developer account + HTTPS domain)
3. Set Site URL to production domain
4. Add Redirect URLs: `http://localhost:3000/auth/callback` and production `/auth/callback`

## Local dev with ngrok (for Replicate webhooks + Apple OAuth)

Replicate cannot POST to `localhost`. For local testing:
```bash
ngrok http 3000
# Then set NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app in .env.local
```
