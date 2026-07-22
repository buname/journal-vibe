"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

type TradeImageUploaderProps = {
  name: string;
  defaultValue?: string[];
};

export function TradeImageUploader({
  name,
  defaultValue = [],
}: TradeImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const files = Array.from(fileList);
      const uploaded: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          continue;
        }
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push(blob.url);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(urls)} />

      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, index) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-lg border border-border/70 bg-muted/30"
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Trade screenshot ${index + 1}`}
                  className="aspect-video w-full object-cover transition-opacity group-hover:opacity-90"
                />
              </a>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploading ? "Uploading…" : "Add image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
