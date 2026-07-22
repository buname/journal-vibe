"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ImageGalleryProps = {
  images: string[];
  altLabel?: string;
};

export function ImageGallery({ images, altLabel = "Image" }: ImageGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const total = images?.length ?? 0;

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + total) % total)),
    [total],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % total)),
    [total],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

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
            className="h-32 w-48 overflow-hidden rounded-lg border border-border/70 bg-muted/30 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-40 sm:w-60"
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
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur transition hover:bg-foreground/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  prev();
                }}
                className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur transition hover:bg-foreground/20"
                aria-label="Previous"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur transition hover:bg-foreground/20"
                aria-label="Next"
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                {active + 1} / {total}
              </span>
            </>
          ) : null}

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
