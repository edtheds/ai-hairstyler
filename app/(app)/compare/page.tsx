import { createClient } from "@/lib/supabase/server";
import { ComparisonView } from "@/components/features/collections/ComparisonView";

export default async function ComparePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("comparison_sessions")
    .select("pinned_image_ids")
    .eq("user_id", user!.id)
    .single();

  const pinnedIds: string[] = session?.pinned_image_ids ?? [];

  const pinnedImages =
    pinnedIds.length > 0
      ? await Promise.all(
          pinnedIds.map(async (generationId) => {
            const { data } = await supabase
              .from("generations")
              .select("result_url, prompt, created_at")
              .eq("id", generationId)
              .eq("user_id", user!.id)
              .single();

            return data
              ? {
                  generationId,
                  resultUrl: data.result_url ?? "",
                  prompt: data.prompt,
                  createdAt: data.created_at,
                }
              : null;
          })
        ).then((results) =>
          results.filter((r): r is NonNullable<typeof r> => r !== null && r.resultUrl !== "")
        )
      : [];

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Compare</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pinnedImages.length} of 4 images pinned
          </p>
        </div>
      </div>
      <ComparisonView pinnedImages={pinnedImages} />
    </main>
  );
}
