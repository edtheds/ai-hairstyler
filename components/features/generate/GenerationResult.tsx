"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateSignedDownloadUrl } from "@/lib/utils/image";

interface GenerationResultProps {
  generationId: string;
  resultUrl: string; // Supabase storage path
  onRegenerate: () => void;
  onSave: (generationId: string) => void;
}

export function GenerationResult({
  generationId,
  resultUrl,
  onRegenerate,
  onSave,
}: GenerationResultProps) {
  const signedImageUrl = `/api/image-proxy?path=${encodeURIComponent(resultUrl)}`;

  async function handleDownload() {
    try {
      const url = await generateSignedDownloadUrl("generated", resultUrl);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hairstyle.jpg";
      a.click();
    } catch {
      toast.error("Download failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden bg-muted aspect-square relative max-w-sm mx-auto">
        <Image
          src={signedImageUrl}
          alt="Generated hairstyle"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, 384px"
        />
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={() => onSave(generationId)}>Save to Favorites</Button>
        <Button variant="outline" onClick={handleDownload}>Download</Button>
        <Button variant="ghost" onClick={onRegenerate}>Regenerate</Button>
      </div>
    </div>
  );
}
