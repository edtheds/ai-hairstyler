import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { replicate } from "@/lib/replicate/client";

export const maxDuration = 60;

// Fallback for when the Replicate webhook fails to deliver.
// Called by the frontend after ~30s of a generation still in "processing" state.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: generationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: generation } = await supabase
    .from("generations")
    .select("status, replicate_id, user_id")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (!generation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Already resolved — nothing to do
  if (generation.status === "succeeded" || generation.status === "failed") {
    return NextResponse.json({ status: generation.status });
  }

  if (!generation.replicate_id) {
    return NextResponse.json({ status: generation.status });
  }

  // Fetch prediction status directly from Replicate
  const prediction = await replicate.predictions.get(generation.replicate_id);

  if (prediction.status === "failed" || prediction.error) {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: String(prediction.error ?? "Generation failed"),
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId);
    return NextResponse.json({ status: "failed" });
  }

  if (prediction.status !== "succeeded" || !prediction.output) {
    return NextResponse.json({ status: prediction.status });
  }

  const outputUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output as string;

  if (!outputUrl) return NextResponse.json({ status: "processing" });

  // Download result and store in Supabase so it never expires
  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch output" }, { status: 500 });
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const storagePath = `${generation.user_id}/${generationId}.jpg`;

  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from("generated")
    .upload(storagePath, imageBuffer, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
  }

  await adminClient
    .from("generations")
    .update({
      status: "succeeded",
      result_url: storagePath,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  return NextResponse.json({ status: "succeeded" });
}
