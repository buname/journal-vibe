"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type ImageGalleryProps = {
  images: string[];
  altLabel?: string;
};

export function ImageGallery({ images, altLabel = "Image" }: ImageGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {images.map((src, index) => (
          <button
            key={`${index}-${src.slice(0, 32)}`}
            type="button"
            onClick={() => setActive(index)}
            className="h-24 w-36 overflow-hidden rounded-lg border border-border/70 bg-muted/30 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-28 sm:w-44"
            aria-label={`Open ${altLabel} ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${altLabel} ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {active !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 p-4 backdrop-blur-md duration-300 animate-in fade-in-0"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur transition hover:bg-foreground/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={`${altLabel} ${active + 1}`}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl duration-300 animate-in fade-in-0 zoom-in-95"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
