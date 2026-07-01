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
  {
    slug: "pixie-cut",
    name: "Pixie Cut",
    category: "short",
    sortOrder: 10,
    promptTemplate: "short pixie cut hairstyle, neatly styled{{base}}",
    previewPath: "pixie-cut.jpg",
  },
  {
    slug: "bob",
    name: "Classic Bob",
    category: "short",
    sortOrder: 20,
    promptTemplate: "classic bob haircut, chin length, sleek and straight{{base}}",
    previewPath: "bob.jpg",
  },
  {
    slug: "long-waves",
    name: "Long Waves",
    category: "long",
    sortOrder: 30,
    promptTemplate: "long wavy hair, loose beach waves, flowing{{base}}",
    previewPath: "long-waves.jpg",
  },
  {
    slug: "curly-afro",
    name: "Curly Afro",
    category: "curly",
    sortOrder: 40,
    promptTemplate: "natural curly afro hairstyle, voluminous coils{{base}}",
    previewPath: "curly-afro.jpg",
  },
  {
    slug: "braids",
    name: "Box Braids",
    category: "long",
    sortOrder: 50,
    promptTemplate: "box braids hairstyle, medium length, neat partings{{base}}",
    previewPath: "braids.jpg",
  },
  {
    slug: "platinum-blonde",
    name: "Platinum Blonde",
    category: "color",
    sortOrder: 60,
    promptTemplate: "platinum blonde hair color, ice blonde, bright and vibrant{{base}}",
    previewPath: "platinum-blonde.jpg",
  },
  {
    slug: "auburn-red",
    name: "Auburn Red",
    category: "color",
    sortOrder: 70,
    promptTemplate: "auburn red hair color, warm coppery tones{{base}}",
    previewPath: "auburn-red.jpg",
  },
  {
    slug: "balayage",
    name: "Balayage",
    category: "color",
    sortOrder: 80,
    promptTemplate: "balayage highlights, natural sun-kissed color blend{{base}}",
    previewPath: "balayage.jpg",
  },
  {
    slug: "lob",
    name: "Lob (Long Bob)",
    category: "medium",
    sortOrder: 90,
    promptTemplate: "lob haircut, long bob, shoulder length, polished{{base}}",
    previewPath: "lob.jpg",
  },
  {
    slug: "curtain-bangs",
    name: "Curtain Bangs",
    category: "medium",
    sortOrder: 100,
    promptTemplate: "curtain bangs with medium length hair, soft parted fringe{{base}}",
    previewPath: "curtain-bangs.jpg",
  },
];
