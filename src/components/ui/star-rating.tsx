"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  name: string;
  defaultValue?: number | null;
  max?: number;
};

export function StarRating({ name, defaultValue, max = 5 }: StarRatingProps) {
  const [selected, setSelected] = useState(defaultValue ?? 0);
  const [hovered, setHovered] = useState(0);

  const active = hovered || selected;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={selected} />
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = value <= active;

        return (
          <button
            key={value}
            type="button"
            className={cn(
              "rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filled ? "text-yellow-400" : "text-muted-foreground/40",
            )}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(value === selected ? 0 : value)}
            aria-label={`${value} yıldız`}
          >
            <Star
              className="size-6"
              fill={filled ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {selected > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">{selected}/{max}</span>
      )}
    </div>
  );
}

export function StarRatingDisplay({
  value,
  max = 5,
}: {
  value: number | null;
  max?: number;
}) {
  if (!value) return null;

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= value;
        return (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              filled ? "text-yellow-400" : "text-muted-foreground/30",
            )}
            fill={filled ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        );
      })}
    </span>
  );
}
