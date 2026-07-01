"use client";

import { useRouter } from "next/navigation";
import { CreateCollectionDialog } from "@/components/features/collections/CreateCollectionDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CollectionsClientWrapper() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        New collection
      </Button>
      <CreateCollectionDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
