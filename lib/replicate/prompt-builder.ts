import type { CatalogStyle } from "@/lib/catalog/styles";

export interface StyleAttributes {
  length: number;      // 0–100
  curl: number;        // 0–100
  color: string;       // hex or named color
  highlight: number;   // 0–100
}

function lengthToken(v: number): string {
  if (v <= 15) return "buzz cut";
  if (v <= 35) return "short hair";
  if (v <= 60) return "medium length hair";
  if (v <= 80) return "shoulder length hair";
  return "long hair";
}

function curlToken(v: number): string {
  if (v <= 20) return "straight";
  if (v <= 45) return "slightly wavy";
  if (v <= 70) return "curly";
  return "coily";
}

function highlightToken(v: number): string {
  if (v <= 15) return "";
  if (v <= 50) return "subtle highlights";
  return "bold highlights";
}

function attributesToText(attrs: StyleAttributes): string {
  const parts: string[] = [
    `${lengthToken(attrs.length)}`,
    `${curlToken(attrs.curl)} hair`,
  ];
  if (attrs.color) parts.push(`${attrs.color} hair color`);
  const hl = highlightToken(attrs.highlight);
  if (hl) parts.push(hl);
  return parts.join(", ");
}

export interface BuildPromptOptions {
  catalogStyle?: CatalogStyle;
  freeText?: string;
  attributes?: StyleAttributes;
}

export function buildPrompt(options: BuildPromptOptions): string {
  const { catalogStyle, freeText, attributes } = options;

  // Build the base text from free text and/or attributes
  const baseParts: string[] = [];
  if (attributes) baseParts.push(attributesToText(attributes));
  if (freeText?.trim()) baseParts.push(freeText.trim());
  const base = baseParts.length > 0 ? `, ${baseParts.join(", ")}` : "";

  if (catalogStyle) {
    return catalogStyle.promptTemplate.replace("{{base}}", base);
  }

  // No catalog style — use base text directly
  const fallback = baseParts.join(", ");
  return fallback || "natural hairstyle";
}
