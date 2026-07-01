import { NextResponse } from "next/server";
import { validateWebhook } from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Validate webhook signature
  const webhookId = request.headers.get("webhook-id") ?? "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = request.headers.get("webhook-signature") ?? "";

  const isValid = await validateWebhook(request.clone(), secret);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get("generationId");

  if (!generationId) {
    return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
  }

  const payload = await request.json() as {
    status: string;
    output?: string | string[];
    error?: string;
  };

  const supabase = createAdminClient();

  if (payload.status === "failed" || payload.error) {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: payload.error ?? "Generation failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId);

    return NextResponse.json({ ok: true });
  }

  if (payload.status !== "succeeded" || !payload.output) {
    // Intermediate status — nothing to do
    return NextResponse.json({ ok: true });
  }

  const outputUrl = Array.isArray(payload.output)
    ? payload.output[0]
    : payload.output;

  if (!outputUrl) {
    return NextResponse.json({ error: "No output URL" }, { status: 400 });
  }

  // Fetch the result and store it in Supabase Storage so it never expires
  const { data: generation } = await supabase
    .from("generations")
    .select("user_id")
    .eq("id", generationId)
    .single();

  if (!generation) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch output" }, { status: 500 });
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const storagePath = `${generation.user_id}/${generationId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("generated")
    .upload(storagePath, imageBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
  }

  await supabase
    .from("generations")
    .update({
      status: "succeeded",
      result_url: storagePath,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  // Suppress unused variable warnings for header values used in validateWebhook
  void webhookId;
  void webhookTimestamp;
  void webhookSignature;

  return NextResponse.json({ ok: true });
}
