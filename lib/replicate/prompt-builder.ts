import type { CatalogStyle } from "@/lib/catalog/styles";

export interface StyleAttributes {
  length: number;    // 0–100
  curl: number;      // 0–100
  color: string;     // slider color value (see AttributeSliders COLORS)
  highlight: number; // 0–100 (not used by this model)
}

// Maps the slider color pill values to the model's hair_color enum
const SLIDER_COLOR_MAP: Record<string, string> = {
  "":               "No change",
  "blonde":         "Blonde",
  "brunette":       "Brunette",
  "jet black":      "Jet Black",
  "vibrant red":    "Red",
  "auburn":         "Auburn",
  "platinum blonde":"Platinum Blonde",
  "silver grey":    "Silver",
};

// Maps curl + length sliders to the model's haircut enum
function sliderToHaircut(length: number, curl: number): string {
  if (length <= 15) return "Crew Cut";  // very short

  if (curl <= 20) {
    if (length <= 35) return "Straight";
    if (length <= 60) return "Bob";
    return "Straight";
  }
  if (curl <= 45) {
    if (length <= 35) return "Shag";
    if (length <= 60) return "Lob";
    return "Soft Waves";
  }
  if (curl <= 70) {
    if (length <= 35) return "Perm";
    return "Curly";
  }
  // coily
  return "Twist Out";
}

export interface ModelInput {
  haircut: string;
  hair_color: string;
  gender: string;
  aspect_ratio: string;
  output_format: string;
}

export interface BuildModelInputOptions {
  catalogStyle?: CatalogStyle;
  attributes?: StyleAttributes;
}

export function buildModelInput({ catalogStyle, attributes }: BuildModelInputOptions): ModelInput {
  let haircut = "No change";
  let hair_color = "No change";

  if (catalogStyle) {
    if (catalogStyle.modelHaircut) haircut = catalogStyle.modelHaircut;
    if (catalogStyle.modelHairColor) hair_color = catalogStyle.modelHairColor;
  } else if (attributes) {
    haircut = sliderToHaircut(attributes.length, attributes.curl);
    hair_color = SLIDER_COLOR_MAP[attributes.color] ?? "No change";
  }

  return {
    haircut,
    hair_color,
    gender: "none",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
  };
}

// Human-readable summary for audit trail (stored in generations.prompt)
export function modelInputLabel(input: ModelInput): string {
  const parts: string[] = [];
  if (input.haircut !== "No change") parts.push(`Haircut: ${input.haircut}`);
  if (input.hair_color !== "No change") parts.push(`Color: ${input.hair_color}`);
  return parts.length > 0 ? parts.join(" | ") : "No change";
}
