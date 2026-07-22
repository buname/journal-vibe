"use client";

import { X } from "lucide-react";
import { useState } from "react";

type ImageGalleryProps = {
  images: string[];
  altLabel?: string;
};

export function ImageGallery({ images, altLabel = "Image" }: ImageGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={`${index}-${src.slice(0, 32)}`}
            type="button"
            onClick={() => setActive(index)}
            className="group overflow-hidden rounded-lg border border-border/70 bg-muted/30"
            aria-label={`Open ${altLabel} ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${altLabel} ${index + 1}`}
              className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {active !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={`${altLabel} ${active + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
