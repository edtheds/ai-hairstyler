"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateSignedDownloadUrl } from "@/lib/utils/image";
import { removeFromCollection } from "@/app/actions/collections";
import { useComparison } from "@/hooks/useComparison";

interface SavedImageCardProps {
  savedItemId: string;
  generationId: string;
  resultUrl: string;
  prompt: string | null;
  createdAt: string;
  onRemoved: (savedItemId: string) => void;
  comparison: ReturnType<typeof useComparison>;
}

export function SavedImageCard({
  savedItemId,
  generationId,
  resultUrl,
  prompt,
  createdAt,
  onRemoved,
  comparison,
}: SavedImageCardProps) {
  const isPinned = comparison.pinned.includes(generationId);

  async function handleDownload() {
    try {
      const url = await generateSignedDownloadUrl("generated", resultUrl);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hairstyle.webp";
      a.click();
    } catch {
      toast.error("Download failed");
    }
  }

  async function handleRemove() {
    try {
      await removeFromCollection(savedItemId);
      onRemoved(savedItemId);
    } catch {
      toast.error("Failed to remove");
    }
  }

  return (
    <div className="group rounded-lg border overflow-hidden">
      <div className="aspect-square bg-muted relative">
        <Image
          src={`/api/image-proxy?path=${encodeURIComponent(resultUrl)}`}
          alt={prompt ?? "Generated hairstyle"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-3 space-y-2">
        {prompt && (
          <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
        )}
        <p className="text-xs text-muted-foreground/60">
          {new Date(createdAt).toLocaleDateString()}
        </p>

        <div className="flex gap-1 flex-wrap">
          <Button
            variant={isPinned ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() =>
              isPinned
                ? comparison.unpin(generationId)
                : comparison.pin(generationId)
            }
          >
            {isPinned ? "Pinned" : "Compare"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
