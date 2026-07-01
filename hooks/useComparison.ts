"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { pinForComparison, unpinFromComparison } from "@/app/actions/collections";

export function useComparison(initialPinned: string[] = []) {
  const [pinned, setPinned] = useState<string[]>(initialPinned);
  const [isPending, startTransition] = useTransition();

  function pin(generationId: string) {
    if (pinned.includes(generationId)) return;
    if (pinned.length >= 4) {
      toast.error("Maximum 4 images can be pinned for comparison");
      return;
    }

    setPinned((prev) => [...prev, generationId]);

    startTransition(async () => {
      try {
        await pinForComparison(generationId);
      } catch (err) {
        setPinned((prev) => prev.filter((id) => id !== generationId));
        toast.error(err instanceof Error ? err.message : "Failed to pin image");
      }
    });
  }

  function unpin(generationId: string) {
    setPinned((prev) => prev.filter((id) => id !== generationId));

    startTransition(async () => {
      try {
        await unpinFromComparison(generationId);
      } catch {
        setPinned((prev) => [...prev, generationId]);
        toast.error("Failed to unpin image");
      }
    });
  }

  return { pinned, pin, unpin, isPending };
}
