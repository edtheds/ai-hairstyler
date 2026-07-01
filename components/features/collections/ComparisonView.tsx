"use client";

import Image from "next/image";
import { useComparison } from "@/hooks/useComparison";
import { Button } from "@/components/ui/button";

interface PinnedImage {
  generationId: string;
  resultUrl: string;
  prompt: string | null;
  createdAt: string;
}

interface ComparisonViewProps {
  pinnedImages: PinnedImage[];
}

export function ComparisonView({ pinnedImages }: ComparisonViewProps) {
  const comparison = useComparison(pinnedImages.map((i) => i.generationId));

  const visible = pinnedImages.filter((img) =>
    comparison.pinned.includes(img.generationId)
  );

  if (visible.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        No images pinned for comparison.
        <br />
        Go to your saved images and click &quot;Compare&quot; on up to 4 images.
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        visible.length === 1
          ? "grid-cols-1 max-w-sm mx-auto"
          : visible.length === 2
          ? "grid-cols-2"
          : visible.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 md:grid-cols-4"
      }`}
    >
      {visible.map((img) => (
        <div key={img.generationId} className="space-y-2">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={`/api/image-proxy?path=${encodeURIComponent(img.resultUrl)}`}
              alt={img.prompt ?? "Generated hairstyle"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 25vw"
            />
          </div>
          {img.prompt && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {img.prompt}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => comparison.unpin(img.generationId)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
