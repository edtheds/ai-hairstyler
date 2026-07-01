"use server";

import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/errors";

interface UploadResult {
  uploadId: string;
  signedUrl: string;
  storagePath: string;
  publicUrl: string;
}

export async function uploadPhoto(
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new AppError("Unauthorized", "UNAUTHORIZED", 401);

  const ext = filename.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data: signedData, error: signedError } = await supabase.storage
    .from("uploads")
    .createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    throw new AppError("Failed to create upload URL", "STORAGE_ERROR");
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${storagePath}`;

  const { data: upload, error: dbError } = await supabase
    .from("uploads")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      public_url: publicUrl,
    })
    .select("id")
    .single();

  if (dbError || !upload) {
    throw new AppError("Failed to record upload", "DB_ERROR");
  }

  return {
    uploadId: upload.id,
    signedUrl: signedData.signedUrl,
    storagePath,
    publicUrl,
  };
}
