import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { replicate } from "@/lib/replicate/client";
import { MODELS } from "@/lib/replicate/models";
import { buildPrompt } from "@/lib/replicate/prompt-builder";
import type { StyleAttributes } from "@/lib/replicate/prompt-builder";
import type { CatalogStyle } from "@/lib/catalog/styles";

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
    freeText?: string;
    attributes?: StyleAttributes;
    refPhotoUrl?: string;
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
    return NextResponse.json(
      { error: "Daily generation limit reached" },
      { status: 429 }
    );
  }

  // Fetch upload record to get the source image URL
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .select("public_url")
    .eq("id", body.uploadId)
    .eq("user_id", user.id)
    .single();

  if (uploadError || !upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  // Resolve catalog style if provided
  let catalogStyle: CatalogStyle | undefined;
  if (body.styleId) {
    const { data: style } = await supabase
      .from("styles")
      .select("slug, name, category, sort_order, prompt_template, preview_url")
      .eq("id", body.styleId)
      .single();

    if (style) {
      catalogStyle = {
        slug: style.slug,
        name: style.name,
        category: style.category as CatalogStyle["category"],
        sortOrder: style.sort_order,
        promptTemplate: style.prompt_template,
        previewPath: style.preview_url,
      };
    }
  }

  const prompt = buildPrompt({
    catalogStyle,
    freeText: body.freeText,
    attributes: body.attributes,
  });

  // Insert generation row before calling Replicate so we have an ID to return
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      upload_id: body.uploadId,
      prompt,
      style_id: body.styleId ?? null,
      ref_photo_url: body.refPhotoUrl ?? null,
      attributes: (body.attributes ?? null) as import("@/types/database.types").Json | null,
      status: "pending",
    })
    .select("id")
    .single();

  if (genError || !generation) {
    return NextResponse.json({ error: "Failed to create generation" }, { status: 500 });
  }

  // Build webhook URL — skip webhook in local dev (Replicate can't reach localhost)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const isLocal = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
  const webhookUrl = isLocal
    ? undefined
    : `${appUrl}/api/webhooks/replicate?generationId=${generation.id}`;

  try {
    const prediction = await replicate.predictions.create({
      model: MODELS.haircutChange,
      input: {
        image: upload.public_url,
        prompt,
      },
      ...(webhookUrl
        ? {
            webhook: webhookUrl,
            webhook_events_filter: ["completed"],
          }
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

    return NextResponse.json({ error: "Replicate error" }, { status: 500 });
  }
}
