"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PhotoUploader } from "./PhotoUploader";
import { StyleCatalog } from "./StyleCatalog";
import { AttributeSliders } from "./AttributeSliders";
import { GenerationResult } from "./GenerationResult";
import { GenerationSkeleton } from "./GenerationSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";
import { saveToFavorites } from "@/app/actions/collections";
import type { CatalogStyle } from "@/lib/catalog/styles";
import type { StyleAttributes } from "@/lib/replicate/prompt-builder";

interface GenerateLayoutProps {
  styles: (CatalogStyle & { id: string })[];
}

const DEFAULT_ATTRIBUTES: StyleAttributes = {
  length: 50,
  curl: 20,
  color: "",
  highlight: 0,
};

export function GenerateLayout({ styles }: GenerateLayoutProps) {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [attributes, setAttributes] = useState<StyleAttributes>(DEFAULT_ATTRIBUTES);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { status, resultUrl } = useGenerationStatus(generationId);

  async function handleGenerate() {
    if (!uploadId) {
      toast.error("Please upload a photo first.");
      return;
    }

    setSubmitting(true);
    setGenerationId(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          styleId: selectedStyleId,
          freeText: freeText || undefined,
          attributes,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        toast.error(error ?? "Generation failed");
        return;
      }

      const { generationId: id } = await res.json() as { generationId: string };
      setGenerationId(id);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(id: string) {
    try {
      await saveToFavorites(id);
      toast.success("Saved to Favorites");
    } catch {
      toast.error("Failed to save");
    }
  }

  const isGenerating = status === "pending" || status === "processing";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: controls */}
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-2">Your photo</h2>
          <PhotoUploader
            onUpload={(id) => setUploadId(id)}
            label="Upload a photo of yourself"
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Style</h2>
          <Tabs defaultValue="catalog">
            <TabsList className="w-full">
              <TabsTrigger value="catalog" className="flex-1">Catalog</TabsTrigger>
              <TabsTrigger value="prompt" className="flex-1">Prompt</TabsTrigger>
              <TabsTrigger value="sliders" className="flex-1">Sliders</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="mt-4">
              <StyleCatalog
                styles={styles}
                selectedId={selectedStyleId}
                onSelect={setSelectedStyleId}
              />
            </TabsContent>

            <TabsContent value="prompt" className="mt-4">
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder='e.g. "short curly bob, platinum blonde with subtle highlights"'
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </TabsContent>

            <TabsContent value="sliders" className="mt-4">
              <AttributeSliders value={attributes} onChange={setAttributes} />
            </TabsContent>
          </Tabs>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!uploadId || submitting || isGenerating}
          className="w-full"
          size="lg"
        >
          {submitting || isGenerating ? "Generating…" : "Generate"}
        </Button>
      </div>

      {/* Right: result */}
      <div className="flex items-start justify-center pt-4">
        {isGenerating && <GenerationSkeleton />}

        {status === "succeeded" && resultUrl && generationId && (
          <GenerationResult
            generationId={generationId}
            resultUrl={resultUrl}
            onRegenerate={handleGenerate}
            onSave={handleSave}
          />
        )}

        {status === "failed" && (
          <div className="text-center space-y-2">
            <p className="text-destructive text-sm">Generation failed.</p>
            <Button variant="outline" size="sm" onClick={handleGenerate}>
              Try again
            </Button>
          </div>
        )}

        {status === "idle" && !isGenerating && (
          <div className="text-center text-muted-foreground text-sm mt-20">
            Upload a photo and choose a style to get started.
          </div>
        )}
      </div>
    </div>
  );
}
