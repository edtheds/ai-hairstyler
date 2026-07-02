-- Synced from lib/catalog/styles.ts — re-run after editing that file.
insert into public.styles (slug, name, category, sort_order, prompt_template, preview_url)
values
  -- Short
  ('buzz-cut',       'Buzz Cut',        'short',  10,  'buzz cut hairstyle, very short all around, clean and neat{{base}}',                      'buzz-cut.jpg'),
  ('crew-cut',       'Crew Cut',        'short',  20,  'crew cut hairstyle, short on sides and back, slightly longer on top{{base}}',             'crew-cut.jpg'),
  ('fade',           'Fade',            'short',  30,  'fade haircut, skin fade on sides, clean taper, short on top{{base}}',                     'fade.jpg'),
  ('undercut',       'Undercut',        'short',  40,  'undercut hairstyle, shaved sides, longer hair on top styled back{{base}}',                'undercut.jpg'),
  ('textured-crop',  'Textured Crop',   'short',  50,  'textured crop haircut, short messy fringe, choppy layers on top{{base}}',                 'textured-crop.jpg'),
  ('pixie-cut',      'Pixie Cut',       'short',  60,  'short pixie cut hairstyle, neatly styled{{base}}',                                        'pixie-cut.jpg'),
  ('bob',            'Classic Bob',     'short',  70,  'classic bob haircut, chin length, sleek and straight{{base}}',                            'bob.jpg'),
  -- Medium
  ('pompadour',      'Pompadour',       'medium', 110, 'pompadour hairstyle, voluminous swept-back top, short sides{{base}}',                     'pompadour.jpg'),
  ('slick-back',     'Slick Back',      'medium', 120, 'slicked back hairstyle, smooth hair combed back, polished look{{base}}',                  'slick-back.jpg'),
  ('side-part',      'Side Part',       'medium', 130, 'side part hairstyle, classic clean parting, neatly combed{{base}}',                       'side-part.jpg'),
  ('lob',            'Lob (Long Bob)',  'medium', 140, 'lob haircut, long bob, shoulder length, polished{{base}}',                                'lob.jpg'),
  ('curtain-bangs',  'Curtain Bangs',   'medium', 150, 'curtain bangs with medium length hair, soft parted fringe{{base}}',                       'curtain-bangs.jpg'),
  ('shag',           'Shag',            'medium', 160, 'shag haircut, layered medium length hair, feathered ends, effortless{{base}}',             'shag.jpg'),
  -- Long
  ('man-bun',        'Man Bun',         'long',   210, 'man bun hairstyle, long hair tied up in a bun on top{{base}}',                            'man-bun.jpg'),
  ('long-waves',     'Long Waves',      'long',   220, 'long wavy hair, loose beach waves, flowing{{base}}',                                      'long-waves.jpg'),
  ('braids',         'Box Braids',      'long',   230, 'box braids hairstyle, medium length, neat partings{{base}}',                              'braids.jpg'),
  ('cornrows',       'Cornrows',        'long',   240, 'cornrow braids hairstyle, neat straight-back rows close to scalp{{base}}',                'cornrows.jpg'),
  ('dreadlocks',     'Dreadlocks',      'long',   250, 'dreadlocks hairstyle, long locs, natural textured{{base}}',                               'dreadlocks.jpg'),
  -- Curly
  ('curly-afro',     'Curly Afro',      'curly',  310, 'natural curly afro hairstyle, voluminous coils{{base}}',                                  'curly-afro.jpg'),
  ('tight-coils',    'Tight Coils',     'curly',  320, 'tight coily hair, defined small curls, natural texture{{base}}',                          'tight-coils.jpg'),
  ('loose-curls',    'Loose Curls',     'curly',  330, 'loose curly hair, bouncy defined ringlets, shoulder length{{base}}',                      'loose-curls.jpg'),
  ('curly-fringe',   'Curly Fringe',    'curly',  340, 'short curly hair with curly fringe, textured top, faded sides{{base}}',                   'curly-fringe.jpg'),
  -- Color
  ('platinum-blonde','Platinum Blonde', 'color',  410, 'platinum blonde hair color, ice blonde, bright and vibrant{{base}}',                      'platinum-blonde.jpg'),
  ('auburn-red',     'Auburn Red',      'color',  420, 'auburn red hair color, warm coppery tones{{base}}',                                       'auburn-red.jpg'),
  ('balayage',       'Balayage',        'color',  430, 'balayage highlights, natural sun-kissed color blend{{base}}',                             'balayage.jpg'),
  ('jet-black',      'Jet Black',       'color',  440, 'jet black hair color, deep glossy black, sleek{{base}}',                                  'jet-black.jpg'),
  ('silver-grey',    'Silver Grey',     'color',  450, 'silver grey hair color, steel grey, modern and striking{{base}}',                         'silver-grey.jpg'),
  ('pastel-pink',    'Pastel Pink',     'color',  460, 'pastel pink hair color, soft rose pink, dreamy{{base}}',                                  'pastel-pink.jpg'),
  ('blue-tones',     'Blue Tones',      'color',  470, 'blue hair color, deep ocean blue tones, vibrant{{base}}',                                 'blue-tones.jpg')
on conflict (slug) do update set
  name            = excluded.name,
  category        = excluded.category,
  sort_order      = excluded.sort_order,
  prompt_template = excluded.prompt_template,
  preview_url     = excluded.preview_url;
