import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { replicate } from "@/lib/replicate/client";
import { MODELS } from "@/lib/replicate/models";
import { buildModelInput, modelInputLabel } from "@/lib/replicate/prompt-builder";
import type { StyleAttributes } from "@/lib/replicate/prompt-builder";
import type { CatalogStyle } from "@/lib/catalog/styles";

export const maxDuration = 30;

const DAILY_GENERATION_LIMIT = 20;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    uploadId: string;
    styleId?: string;
    attributes?: StyleAttributes;
  };

  if (!body.uploadId) {
    return NextResponse.json({ error: "uploadId is required" }, { status: 400 });
  }

  // Rate limit: max DAILY_GENERATION_LIMIT generations per user per day
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= DAILY_GENERATION_LIMIT) {
    return NextResponse.json({ error: "Daily generation limit reached" }, { status: 429 });
  }

  // Fetch upload record to get the storage path
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .select("storage_path")
    .eq("id", body.uploadId)
    .eq("user_id", user.id)
    .single();

  if (uploadError || !upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  // Signed URL so Replicate can download the private image (valid 1h)
  const adminClient = createAdminClient();
  const { data: signedData, error: signedError } = await adminClient.storage
    .from("uploads")
    .createSignedUrl(upload.storage_path, 3600);

  if (signedError || !signedData) {
    return NextResponse.json({ error: "Failed to sign upload URL" }, { status: 500 });
  }
  const imageUrl = signedData.signedUrl;

  // Resolve catalog style model mappings if a style was selected
  let catalogStyle: CatalogStyle | undefined;
  if (body.styleId) {
    const { data: style } = await supabase
      .from("styles")
      .select("slug, name, category, sort_order, prompt_template, preview_url")
      .eq("id", body.styleId)
      .single();

    if (style) {
      // Re-attach model fields from the TypeScript catalog (source of truth)
      const { STYLES } = await import("@/lib/catalog/styles");
      const catalogEntry = STYLES.find((s) => s.slug === style.slug);
      catalogStyle = catalogEntry ?? {
        slug: style.slug,
        name: style.name,
        category: style.category as CatalogStyle["category"],
        sortOrder: style.sort_order,
        promptTemplate: style.prompt_template,
        previewPath: style.preview_url,
      };
    }
  }

  // Build structured model inputs
  const modelInput = buildModelInput({ catalogStyle, attributes: body.attributes });
  const promptLabel = modelInputLabel(modelInput);

  // Insert generation row before calling Replicate
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      upload_id: body.uploadId,
      prompt: promptLabel,
      style_id: body.styleId ?? null,
      attributes: modelInput as unknown as import("@/types/database.types").Json,
      status: "pending",
    })
    .select("id")
    .single();

  if (genError || !generation) {
    return NextResponse.json({ error: "Failed to create generation" }, { status: 500 });
  }

  // Derive webhook URL. Use x-forwarded-host so we get the public domain even
  // when Vercel internally rewrites request.url to a deployment-specific URL.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? "";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin;
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const webhookUrl = isLocal
    ? undefined
    : `${origin}/api/webhooks/replicate?generationId=${generation.id}`;
  console.log("[generate] webhook origin:", origin, "isLocal:", isLocal, "webhookUrl:", webhookUrl);

  try {
    const prediction = await replicate.predictions.create({
      model: MODELS.haircutChange,
      input: {
        input_image: imageUrl,
        ...modelInput,
      },
      ...(webhookUrl
        ? { webhook: webhookUrl, webhook_events_filter: ["completed"] }
        : {}),
    });

    await supabase
      .from("generations")
      .update({ replicate_id: prediction.id, status: "processing" })
      .eq("id", generation.id);

    return NextResponse.json({ generationId: generation.id });
  } catch (err) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: String(err) })
      .eq("id", generation.id);

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
