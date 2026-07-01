import { createClient } from "@/lib/supabase/server";
import { CollectionGrid } from "@/components/features/collections/CollectionGrid";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", user!.id)
    .eq("is_default", true)
    .single();

  const { data: items } = favorites
    ? await supabase
        .from("saved_items")
        .select("id, generation_id, created_at, generations(result_url, prompt, created_at)")
        .eq("collection_id", favorites.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: session } = await supabase
    .from("comparison_sessions")
    .select("pinned_image_ids")
    .eq("user_id", user!.id)
    .single();

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-6">Favorites</h1>
      <CollectionGrid
        items={(items ?? []) as Parameters<typeof CollectionGrid>[0]["items"]}
        initialPinnedIds={session?.pinned_image_ids ?? []}
      />
    </main>
  );
}
