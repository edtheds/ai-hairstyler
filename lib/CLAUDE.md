# lib/

Pure TypeScript — no React imports, no JSX, no `"use client"`.

## Subdirectories

- `supabase/` — Three clients, each with a specific use case:
  - `client.ts` → `createBrowserClient` — for Client Components only
  - `server.ts` → `createServerClient` — for Server Components, Server Actions, Route Handlers
  - `admin.ts` → service role client — bypasses RLS; **webhook route handler only**
- `replicate/` — Replicate API wrapper:
  - `client.ts` — Replicate instance
  - `models.ts` — named model constants (change the model here, nowhere else)
  - `prompt-builder.ts` — `buildPrompt()` merges style catalog, free text, and attribute sliders
- `catalog/styles.ts` — Source of truth for the curated style catalog. After editing, run `npx supabase db reset` or manually upsert to sync to DB.
- `utils/` — Pure functions only (`errors.ts`, `image.ts`)

## What does NOT belong here

- React hooks → `hooks/`
- UI components → `components/`
- Server actions → `app/actions/`
- API route handlers → `app/api/`
