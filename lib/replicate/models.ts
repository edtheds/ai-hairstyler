// Change model identifiers here — nowhere else.
export const MODELS = {
  // Primary: face-preserving hairstyle change via FLUX.1 Kontext Pro.
  // Used for text prompt, catalog styles, attribute sliders, and
  // reference-photo-as-text inputs.
  haircutChange: "flux-kontext-apps/change-haircut" as const,

  // Secondary: reference photo hair transfer. Slow (~22 min on T4).
  // Warn user before dispatching.
  hairstyleTransfer: "cjwbw/style-your-hair" as const,
} as const;

export type ModelKey = keyof typeof MODELS;
