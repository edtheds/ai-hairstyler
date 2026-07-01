"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadPhoto } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  onUpload: (uploadId: string, publicUrl: string) => void;
  label?: string;
}

export function PhotoUploader({
  onUpload,
  label = "Upload photo",
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const { uploadId, signedUrl, publicUrl } = await uploadPhoto(
        file.name,
        file.type
      );

      await fetch(signedUrl, { method: "PUT", body: file });
      onUpload(uploadId, publicUrl);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full rounded-lg border-2 border-dashed transition-colors p-4 min-h-[200px] flex flex-col items-center justify-center gap-2 cursor-pointer
          ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}
          ${preview ? "border-solid" : ""}
        `}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Uploaded photo"
            width={300}
            height={300}
            className="rounded-md object-contain max-h-64 w-auto"
          />
        ) : (
          <>
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading…" : label}
            </span>
            <span className="text-xs text-muted-foreground/60">
              Drag & drop or click to browse
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {preview && !uploading && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Remove
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
