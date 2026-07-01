import { createAdminClient } from "@/lib/supabase/admin";

// Returns a short-lived signed URL (60s) for downloading a private image.
export async function generateSignedDownloadUrl(
  bucket: "uploads" | "generated",
  storagePath: string
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60);

  if (error || !data) throw new Error(`Failed to create signed URL: ${error?.message}`);
  return data.signedUrl;
}

// Returns the public URL for a catalog preview image.
export function getCatalogPreviewUrl(previewPath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/catalog-previews/${previewPath}`;
}
