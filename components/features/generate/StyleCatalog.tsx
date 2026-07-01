"use client";

import { StyleCard } from "./StyleCard";
import type { CatalogStyle } from "@/lib/catalog/styles";

interface StyleCatalogProps {
  styles: (CatalogStyle & { id: string })[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CATEGORIES = ["short", "medium", "long", "curly", "color"] as const;

export function StyleCatalog({ styles, selectedId, onSelect }: StyleCatalogProps) {
  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const group = styles.filter((s) => s.category === category);
        if (group.length === 0) return null;
        return (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {group.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  selected={selectedId === style.id}
                  onSelect={() =>
                    onSelect(selectedId === style.id ? null : style.id)
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
