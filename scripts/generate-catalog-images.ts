/**
 * Generates catalog preview images for every style in lib/catalog/styles.ts.
 *
 * Usage:
 *   npx tsx scripts/generate-catalog-images.ts
 *
 * Output: scripts/catalog-output/<slug>.jpg
 * Then upload those files to the Supabase catalog-previews bucket.
 *
 * Options (env vars):
 *   GENDER=mixed (default) | male | female
 *   START_AT=<slug>  resume from a specific style after a failure
 */

import Replicate from "replicate";
import fs from "fs";
import path from "path";
import { STYLES } from "../lib/catalog/styles";

const OUTPUT_DIR = path.join(import.meta.dirname, "catalog-output");
const MODEL = "black-forest-labs/flux-1.1-pro";

// Locked-down portrait base — every image uses this framing
const BASE_PROMPT = [
  "professional portrait photograph",
  "studio mugshot style",
  "neutral light grey seamless background",
  "soft even studio box lighting",
  "front-facing head and shoulders crop",
  "photorealistic",
  "sharp focus",
  "85mm portrait lens",
  "high resolution",
  "clean skin",
].join(", ");

// Gender pool — cycle through for natural diversity across the catalog
const GENDER_SUBJECTS: Record<string, string[]> = {
  mixed: [
    "young woman",
    "young man",
    "woman",
    "man",
    "person",
    "woman",
    "man",
    "person",
  ],
  female: ["woman", "young woman", "person", "woman", "young woman"],
  male: ["man", "young man", "person", "man", "young man"],
};

function getSubject(index: number): string {
  const gender = (process.env.GENDER ?? "mixed") as keyof typeof GENDER_SUBJECTS;
  const pool = GENDER_SUBJECTS[gender] ?? GENDER_SUBJECTS.mixed;
  return pool[index % pool.length];
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("❌  REPLICATE_API_TOKEN is not set. Add it to .env.local and run:");
    console.error("   npx tsx --env-file=.env.local scripts/generate-catalog-images.ts");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const startAt = process.env.START_AT;
  let startIndex = 0;
  if (startAt) {
    const idx = STYLES.findIndex((s) => s.slug === startAt);
    if (idx === -1) {
      console.error(`❌  START_AT slug "${startAt}" not found`);
      process.exit(1);
    }
    startIndex = idx;
    console.log(`▶  Resuming from "${startAt}" (index ${startIndex})`);
  }

  const styles = STYLES.slice(startIndex);
  console.log(`\n🎨  Generating ${styles.length} catalog images using ${MODEL}\n`);

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    const globalIndex = startIndex + i;
    const outPath = path.join(OUTPUT_DIR, style.previewPath);

    if (fs.existsSync(outPath)) {
      console.log(`⏭   [${globalIndex + 1}/${STYLES.length}] ${style.name} — already exists, skipping`);
      continue;
    }

    const subject = getSubject(globalIndex);
    // Strip the {{base}} slot — not needed for portrait generation
    const styleDesc = style.promptTemplate.replace("{{base}}", "");
    const prompt = `${BASE_PROMPT}, ${subject} with ${styleDesc}`;

    console.log(`⏳  [${globalIndex + 1}/${STYLES.length}] ${style.name} (${subject})`);
    console.log(`    prompt: ${prompt}\n`);

    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const output = await replicate.run(MODEL, {
          input: {
            prompt,
            aspect_ratio: "1:1",
            output_format: "jpg",
            output_quality: 85,
            safety_tolerance: 2,
          },
        });

        // FLUX 1.1 Pro returns a ReadableStream or URL string
        let imageUrl: string;
        if (typeof output === "string") {
          imageUrl = output;
        } else if (output && typeof (output as { url?: () => Promise<string> }).url === "function") {
          imageUrl = await (output as { url: () => Promise<string> }).url();
        } else if (Array.isArray(output) && output.length > 0) {
          imageUrl = String(output[0]);
        } else {
          throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
        }

        await downloadImage(imageUrl, outPath);
        console.log(`✅  Saved → ${outPath}\n`);
        success = true;
        break;
      } catch (err: unknown) {
        const is429 =
          err instanceof Error &&
          (err.message.includes("429") || err.message.includes("throttled"));

        if (is429 && attempt < 5) {
          const wait = attempt * 15_000; // 15s, 30s, 45s, 60s
          console.warn(`⚠️   Rate limited — waiting ${wait / 1000}s before retry ${attempt}/4…`);
          await new Promise((r) => setTimeout(r, wait));
        } else {
          console.error(`❌  Failed: ${style.name}:`, err instanceof Error ? err.message : err);
          console.error(`    Resume with: START_AT=${style.slug} npm run generate:catalog\n`);
          break;
        }
      }
    }

    // Pace requests — 12s between each to stay under 6/min rate limit
    if (success && i < styles.length - 1) {
      process.stdout.write("    Waiting 12s before next request…\r");
      await new Promise((r) => setTimeout(r, 12_000));
    }
  }

  const generated = fs.readdirSync(OUTPUT_DIR).length;
  console.log(`\n✨  Done — ${generated} images in ${OUTPUT_DIR}`);
  console.log(`\nNext step: upload all files in scripts/catalog-output/ to the`);
  console.log(`Supabase catalog-previews bucket.\n`);
}

main();
