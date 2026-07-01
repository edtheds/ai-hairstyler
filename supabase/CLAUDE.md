# supabase/

## Migration rules

- **Never edit an existing migration file.** Always add a new numbered file.
- Naming: `NNN_description.sql` (e.g. `002_add_style_tags.sql`)
- After any schema change: `npx supabase gen types typescript --local > types/database.types.ts`
- To apply locally: `npx supabase db push` (or `db reset` to also run seed)
- To apply to remote: `npx supabase db push --linked`

## Seed

`seed/001_styles.sql` upserts the curated style catalog from `lib/catalog/styles.ts`. To add or edit styles:
1. Edit `lib/catalog/styles.ts`
2. Update `seed/001_styles.sql` to match
3. Run `npx supabase db reset` locally to verify

## Storage buckets

Three buckets (created manually in Supabase Dashboard or via migration):
- `uploads` — private; user source photos and reference photos
- `generated` — private; AI output images
- `catalog-previews` — public; style catalog preview images

## RLS

All tables have RLS enabled. The service role key (used only in the webhook handler) bypasses RLS entirely — no extra policies needed for webhook writes.
