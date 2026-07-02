export type StyleCategory = "short" | "medium" | "long" | "curly" | "color";

export interface CatalogStyle {
  slug: string;
  name: string;
  category: StyleCategory;
  sortOrder: number;
  // Use {{base}} as a slot for optional free-text appended by the user.
  promptTemplate: string;
  // Path in the catalog-previews Supabase bucket.
  previewPath: string;
}

export const STYLES: CatalogStyle[] = [
  // ── Short ──────────────────────────────────────────────────────────────
  {
    slug: "buzz-cut",
    name: "Buzz Cut",
    category: "short",
    sortOrder: 10,
    promptTemplate: "buzz cut hairstyle, very short all around, clean and neat{{base}}",
    previewPath: "buzz-cut.jpg",
  },
  {
    slug: "crew-cut",
    name: "Crew Cut",
    category: "short",
    sortOrder: 20,
    promptTemplate: "crew cut hairstyle, short on sides and back, slightly longer on top{{base}}",
    previewPath: "crew-cut.jpg",
  },
  {
    slug: "fade",
    name: "Fade",
    category: "short",
    sortOrder: 30,
    promptTemplate: "fade haircut, skin fade on sides, clean taper, short on top{{base}}",
    previewPath: "fade.jpg",
  },
  {
    slug: "undercut",
    name: "Undercut",
    category: "short",
    sortOrder: 40,
    promptTemplate: "undercut hairstyle, shaved sides, longer hair on top styled back{{base}}",
    previewPath: "undercut.jpg",
  },
  {
    slug: "textured-crop",
    name: "Textured Crop",
    category: "short",
    sortOrder: 50,
    promptTemplate: "textured crop haircut, short messy fringe, choppy layers on top{{base}}",
    previewPath: "textured-crop.jpg",
  },
  {
    slug: "pixie-cut",
    name: "Pixie Cut",
    category: "short",
    sortOrder: 60,
    promptTemplate: "short pixie cut hairstyle, neatly styled{{base}}",
    previewPath: "pixie-cut.jpg",
  },
  {
    slug: "bob",
    name: "Classic Bob",
    category: "short",
    sortOrder: 70,
    promptTemplate: "classic bob haircut, chin length, sleek and straight{{base}}",
    previewPath: "bob.jpg",
  },

  // ── Medium ─────────────────────────────────────────────────────────────
  {
    slug: "pompadour",
    name: "Pompadour",
    category: "medium",
    sortOrder: 110,
    promptTemplate: "pompadour hairstyle, voluminous swept-back top, short sides{{base}}",
    previewPath: "pompadour.jpg",
  },
  {
    slug: "slick-back",
    name: "Slick Back",
    category: "medium",
    sortOrder: 120,
    promptTemplate: "slicked back hairstyle, smooth hair combed back, polished look{{base}}",
    previewPath: "slick-back.jpg",
  },
  {
    slug: "side-part",
    name: "Side Part",
    category: "medium",
    sortOrder: 130,
    promptTemplate: "side part hairstyle, classic clean parting, neatly combed{{base}}",
    previewPath: "side-part.jpg",
  },
  {
    slug: "lob",
    name: "Lob (Long Bob)",
    category: "medium",
    sortOrder: 140,
    promptTemplate: "lob haircut, long bob, shoulder length, polished{{base}}",
    previewPath: "lob.jpg",
  },
  {
    slug: "curtain-bangs",
    name: "Curtain Bangs",
    category: "medium",
    sortOrder: 150,
    promptTemplate: "curtain bangs with medium length hair, soft parted fringe{{base}}",
    previewPath: "curtain-bangs.jpg",
  },
  {
    slug: "shag",
    name: "Shag",
    category: "medium",
    sortOrder: 160,
    promptTemplate: "shag haircut, layered medium length hair, feathered ends, effortless{{base}}",
    previewPath: "shag.jpg",
  },

  // ── Long ───────────────────────────────────────────────────────────────
  {
    slug: "man-bun",
    name: "Man Bun",
    category: "long",
    sortOrder: 210,
    promptTemplate: "man bun hairstyle, long hair tied up in a bun on top{{base}}",
    previewPath: "man-bun.jpg",
  },
  {
    slug: "long-waves",
    name: "Long Waves",
    category: "long",
    sortOrder: 220,
    promptTemplate: "long wavy hair, loose beach waves, flowing{{base}}",
    previewPath: "long-waves.jpg",
  },
  {
    slug: "braids",
    name: "Box Braids",
    category: "long",
    sortOrder: 230,
    promptTemplate: "box braids hairstyle, medium length, neat partings{{base}}",
    previewPath: "braids.jpg",
  },
  {
    slug: "cornrows",
    name: "Cornrows",
    category: "long",
    sortOrder: 240,
    promptTemplate: "cornrow braids hairstyle, neat straight-back rows close to scalp{{base}}",
    previewPath: "cornrows.jpg",
  },
  {
    slug: "dreadlocks",
    name: "Dreadlocks",
    category: "long",
    sortOrder: 250,
    promptTemplate: "dreadlocks hairstyle, long locs, natural textured{{base}}",
    previewPath: "dreadlocks.jpg",
  },

  // ── Curly ──────────────────────────────────────────────────────────────
  {
    slug: "curly-afro",
    name: "Curly Afro",
    category: "curly",
    sortOrder: 310,
    promptTemplate: "natural curly afro hairstyle, voluminous coils{{base}}",
    previewPath: "curly-afro.jpg",
  },
  {
    slug: "tight-coils",
    name: "Tight Coils",
    category: "curly",
    sortOrder: 320,
    promptTemplate: "tight coily hair, defined small curls, natural texture{{base}}",
    previewPath: "tight-coils.jpg",
  },
  {
    slug: "loose-curls",
    name: "Loose Curls",
    category: "curly",
    sortOrder: 330,
    promptTemplate: "loose curly hair, bouncy defined ringlets, shoulder length{{base}}",
    previewPath: "loose-curls.jpg",
  },
  {
    slug: "curly-fringe",
    name: "Curly Fringe",
    category: "curly",
    sortOrder: 340,
    promptTemplate: "short curly hair with curly fringe, textured top, faded sides{{base}}",
    previewPath: "curly-fringe.jpg",
  },

  // ── Color ──────────────────────────────────────────────────────────────
  {
    slug: "platinum-blonde",
    name: "Platinum Blonde",
    category: "color",
    sortOrder: 410,
    promptTemplate: "platinum blonde hair color, ice blonde, bright and vibrant{{base}}",
    previewPath: "platinum-blonde.jpg",
  },
  {
    slug: "auburn-red",
    name: "Auburn Red",
    category: "color",
    sortOrder: 420,
    promptTemplate: "auburn red hair color, warm coppery tones{{base}}",
    previewPath: "auburn-red.jpg",
  },
  {
    slug: "balayage",
    name: "Balayage",
    category: "color",
    sortOrder: 430,
    promptTemplate: "balayage highlights, natural sun-kissed color blend{{base}}",
    previewPath: "balayage.jpg",
  },
  {
    slug: "jet-black",
    name: "Jet Black",
    category: "color",
    sortOrder: 440,
    promptTemplate: "jet black hair color, deep glossy black, sleek{{base}}",
    previewPath: "jet-black.jpg",
  },
  {
    slug: "silver-grey",
    name: "Silver Grey",
    category: "color",
    sortOrder: 450,
    promptTemplate: "silver grey hair color, steel grey, modern and striking{{base}}",
    previewPath: "silver-grey.jpg",
  },
  {
    slug: "pastel-pink",
    name: "Pastel Pink",
    category: "color",
    sortOrder: 460,
    promptTemplate: "pastel pink hair color, soft rose pink, dreamy{{base}}",
    previewPath: "pastel-pink.jpg",
  },
  {
    slug: "blue-tones",
    name: "Blue Tones",
    category: "color",
    sortOrder: 470,
    promptTemplate: "blue hair color, deep ocean blue tones, vibrant{{base}}",
    previewPath: "blue-tones.jpg",
  },
];
