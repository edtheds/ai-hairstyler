import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateCollectionDialog } from "@/components/features/collections/CreateCollectionDialog";
import { CollectionsClientWrapper } from "./CollectionsClientWrapper";

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, is_default, created_at")
    .eq("user_id", user!.id)
    .order("created_at");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <CollectionsClientWrapper />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(collections ?? []).map((col) => (
          <Link
            key={col.id}
            href={col.is_default ? "/saved" : `/collections/${col.id}`}
            className="rounded-lg border p-4 hover:border-primary/50 transition-colors"
          >
            <p className="font-medium">{col.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(col.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
