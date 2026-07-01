-- Synced from lib/catalog/styles.ts — re-run after editing that file.
insert into public.styles (slug, name, category, sort_order, prompt_template, preview_url)
values
  ('pixie-cut',      'Pixie Cut',      'short',  10,  'short pixie cut hairstyle, neatly styled{{base}}',                              'pixie-cut.jpg'),
  ('bob',            'Classic Bob',    'short',  20,  'classic bob haircut, chin length, sleek and straight{{base}}',                  'bob.jpg'),
  ('long-waves',     'Long Waves',     'long',   30,  'long wavy hair, loose beach waves, flowing{{base}}',                            'long-waves.jpg'),
  ('curly-afro',     'Curly Afro',     'curly',  40,  'natural curly afro hairstyle, voluminous coils{{base}}',                        'curly-afro.jpg'),
  ('braids',         'Box Braids',     'long',   50,  'box braids hairstyle, medium length, neat partings{{base}}',                    'braids.jpg'),
  ('platinum-blonde','Platinum Blonde','color',  60,  'platinum blonde hair color, ice blonde, bright and vibrant{{base}}',            'platinum-blonde.jpg'),
  ('auburn-red',     'Auburn Red',     'color',  70,  'auburn red hair color, warm coppery tones{{base}}',                             'auburn-red.jpg'),
  ('balayage',       'Balayage',       'color',  80,  'balayage highlights, natural sun-kissed color blend{{base}}',                   'balayage.jpg'),
  ('lob',            'Lob (Long Bob)', 'medium', 90,  'lob haircut, long bob, shoulder length, polished{{base}}',                      'lob.jpg'),
  ('curtain-bangs',  'Curtain Bangs',  'medium', 100, 'curtain bangs with medium length hair, soft parted fringe{{base}}',             'curtain-bangs.jpg')
on conflict (slug) do update set
  name           = excluded.name,
  category       = excluded.category,
  sort_order     = excluded.sort_order,
  prompt_template = excluded.prompt_template,
  preview_url    = excluded.preview_url;
