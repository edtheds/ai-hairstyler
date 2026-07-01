"use client";

import Image from "next/image";
import { getCatalogPreviewUrl } from "@/lib/utils/image";
import type { CatalogStyle } from "@/lib/catalog/styles";

interface StyleCardProps {
  style: CatalogStyle & { id: string };
  selected: boolean;
  onSelect: () => void;
}

export function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-lg border-2 overflow-hidden text-left transition-all
        ${selected ? "border-primary" : "border-transparent hover:border-muted-foreground/30"}
      `}
    >
      <div className="aspect-square bg-muted relative">
        <Image
          src={getCatalogPreviewUrl(style.previewPath)}
          alt={style.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{style.name}</p>
      </div>
    </button>
  );
}
