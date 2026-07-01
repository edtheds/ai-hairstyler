"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { saveToCollection, saveToFavorites } from "@/app/actions/collections";
import { CreateCollectionDialog } from "./CreateCollectionDialog";

interface Collection {
  id: string;
  name: string;
  is_default: boolean;
}

interface CollectionSelectorProps {
  generationId: string;
  collections: Collection[];
  onCollectionCreated: (collection: Collection) => void;
}

export function CollectionSelector({
  generationId,
  collections,
  onCollectionCreated,
}: CollectionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleSave(collectionId: string, isDefault: boolean) {
    setOpen(false);
    try {
      if (isDefault) {
        await saveToFavorites(generationId);
      } else {
        await saveToCollection(generationId, collectionId);
      }
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 cursor-pointer">
          Save to…
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {collections.map((col) => (
            <DropdownMenuItem
              key={col.id}
              onClick={() => handleSave(col.id, col.is_default)}
            >
              {col.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setDialogOpen(true);
            }}
          >
            New collection…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={onCollectionCreated}
      />
    </>
  );
}
