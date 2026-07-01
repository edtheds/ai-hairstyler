-- ============================================================
-- 001_initial_schema.sql
-- ============================================================

-- -------------------------------------------------------
-- profiles
-- -------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- -------------------------------------------------------
-- uploads
-- -------------------------------------------------------
create table public.uploads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  public_url   text not null,
  created_at   timestamptz not null default now()
);

alter table public.uploads enable row level security;

create policy "uploads_insert_own" on public.uploads
  for insert to authenticated with check (auth.uid() = user_id);

create policy "uploads_select_own" on public.uploads
  for select using (auth.uid() = user_id);

create index uploads_user_id_idx on public.uploads(user_id);

-- -------------------------------------------------------
-- styles (developer-curated catalog, seeded)
-- -------------------------------------------------------
create table public.styles (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  prompt_template text not null,
  preview_url     text not null,
  category        text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.styles enable row level security;

create policy "styles_select_all" on public.styles
  for select using (true);

-- -------------------------------------------------------
-- generations
-- -------------------------------------------------------
create table public.generations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  upload_id     uuid not null references public.uploads(id),
  replicate_id  text unique,
  status        text not null default 'pending'
                check (status in ('pending', 'processing', 'succeeded', 'failed')),
  prompt        text,
  style_id      uuid references public.styles(id),
  ref_photo_url text,
  attributes    jsonb,
  result_url    text,
  error_message text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

alter table public.generations enable row level security;

create policy "generations_insert_own" on public.generations
  for insert to authenticated with check (auth.uid() = user_id);

create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);

create index generations_user_id_idx on public.generations(user_id);
create index generations_replicate_id_idx on public.generations(replicate_id);

-- -------------------------------------------------------
-- collections
-- -------------------------------------------------------
create table public.collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create policy "collections_all_own" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index collections_user_id_idx on public.collections(user_id);

-- -------------------------------------------------------
-- saved_items
-- -------------------------------------------------------
create table public.saved_items (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique(collection_id, generation_id)
);

alter table public.saved_items enable row level security;

create policy "saved_items_all_own" on public.saved_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index saved_items_collection_id_idx on public.saved_items(collection_id);
create index saved_items_user_id_idx on public.saved_items(user_id);

-- -------------------------------------------------------
-- comparison_sessions
-- -------------------------------------------------------
create table public.comparison_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  pinned_image_ids uuid[] not null default '{}',
  updated_at       timestamptz not null default now()
);

create unique index comparison_sessions_user_id_key on public.comparison_sessions(user_id);

alter table public.comparison_sessions enable row level security;

create policy "comparison_sessions_all_own" on public.comparison_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -------------------------------------------------------
-- Storage bucket RLS
-- (Run after creating buckets in Supabase Dashboard)
-- -------------------------------------------------------

-- uploads bucket: authenticated users write to own user_id prefix
create policy "uploads_bucket_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads_bucket_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- generated bucket: service role writes (webhook), users read own
create policy "generated_bucket_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'generated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- catalog-previews bucket: public read
create policy "catalog_previews_bucket_select_all" on storage.objects
  for select using (bucket_id = 'catalog-previews');

-- -------------------------------------------------------
-- Trigger: auto-create profile + Favorites on user signup
-- -------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.collections (user_id, name, is_default)
  values (new.id, 'Favorites', true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
