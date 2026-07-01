import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CollectionGrid } from "@/components/features/collections/CollectionGrid";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, is_default")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!collection) notFound();

  const { data: items } = await supabase
    .from("saved_items")
    .select("id, generation_id, created_at, generations(result_url, prompt, created_at)")
    .eq("collection_id", collection.id)
    .order("created_at", { ascending: false });

  const { data: session } = await supabase
    .from("comparison_sessions")
    .select("pinned_image_ids")
    .eq("user_id", user!.id)
    .single();

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-6">{collection.name}</h1>
      <CollectionGrid
        items={(items ?? []) as Parameters<typeof CollectionGrid>[0]["items"]}
        initialPinnedIds={session?.pinned_image_ids ?? []}
      />
    </main>
  );
}
