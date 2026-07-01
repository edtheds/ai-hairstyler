import { createClient } from "@/lib/supabase/server";
import { GenerateLayout } from "@/components/features/generate/GenerateLayout";
import type { CatalogStyle } from "@/lib/catalog/styles";

export const revalidate = 3600; // Cache catalog for 1h

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: styles } = await supabase
    .from("styles")
    .select("id, slug, name, category, sort_order, prompt_template, preview_url")
    .order("sort_order");

  const catalogStyles: (CatalogStyle & { id: string })[] = (styles ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category as CatalogStyle["category"],
    sortOrder: s.sort_order,
    promptTemplate: s.prompt_template,
    previewPath: s.preview_url,
  }));

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">AI Hair Studio</h1>
        <p className="text-muted-foreground mt-1">
          Upload a photo and try a new hairstyle.
        </p>
      </div>
      <GenerateLayout styles={catalogStyles} />
    </main>
  );
}
