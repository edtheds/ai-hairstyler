"use client";

import { useState } from "react";
import { SavedImageCard } from "./SavedImageCard";
import { useComparison } from "@/hooks/useComparison";

interface SavedItem {
  id: string;
  generation_id: string;
  created_at: string;
  generations: {
    result_url: string | null;
    prompt: string | null;
    created_at: string;
  } | null;
}

interface CollectionGridProps {
  items: SavedItem[];
  initialPinnedIds: string[];
}

export function CollectionGrid({ items: initialItems, initialPinnedIds }: CollectionGridProps) {
  const [items, setItems] = useState(initialItems);
  const comparison = useComparison(initialPinnedIds);

  function handleRemoved(savedItemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== savedItemId));
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No saved images yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        if (!item.generations?.result_url) return null;
        return (
          <SavedImageCard
            key={item.id}
            savedItemId={item.id}
            generationId={item.generation_id}
            resultUrl={item.generations.result_url}
            prompt={item.generations.prompt}
            createdAt={item.generations.created_at}
            onRemoved={handleRemoved}
            comparison={comparison}
          />
        );
      })}
    </div>
  );
}
