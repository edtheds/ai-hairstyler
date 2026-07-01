import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Proxies private Supabase Storage images for next/image.
// Returns a redirect to a 60s signed URL.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine bucket from path prefix
  const bucket = path.startsWith(user.id)
    ? "generated"
    : "uploads";

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 300);

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
