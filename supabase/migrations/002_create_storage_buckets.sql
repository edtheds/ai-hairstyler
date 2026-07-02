-- Ensure storage buckets exist.
-- Safe to run even if buckets were already created manually (ON CONFLICT DO NOTHING).

insert into storage.buckets (id, name, public)
values
  ('uploads',          'uploads',          false),
  ('generated',        'generated',        false),
  ('catalog-previews', 'catalog-previews', true)
on conflict (id) do nothing;
