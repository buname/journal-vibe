"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DAY_RATING_LABELS = [
  "Awful",
  "Poor",
  "Okay",
  "Good",
  "Amazing",
] as const;

export const DAY_RATING_EMOJIS = ["😡", "😕", "😐", "🙂", "😍"] as const;

type DayRatingSliderProps = {
  className?: string;
  defaultValue?: number | null;
  name: string;
};

export function DayRatingSlider({
  className,
  defaultValue,
  name,
}: DayRatingSliderProps) {
  const initial =
    defaultValue != null && defaultValue > 0 ? defaultValue : 3;
  const [value, setValue] = useState([initial]);
  const [active, setActive] = useState(
    defaultValue != null && defaultValue > 0,
  );

  const current = value[0];
  const submitted = active ? current : 0;

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={submitted} />
      <div className="flex items-center justify-between gap-2">
        <Label className="leading-6">How was your day?</Label>
        <span className="text-sm font-medium text-foreground">
          {active ? DAY_RATING_LABELS[current - 1] : "Not rated"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {DAY_RATING_EMOJIS[0]}
        </span>
        <Slider
          value={value}
          onValueChange={(next) => {
            setValue(next);
            setActive(true);
          }}
          min={1}
          max={5}
          step={1}
          aria-label="Rate your day"
          className={cn(!active && "opacity-70")}
        />
        <span className="text-2xl" aria-hidden>
          {DAY_RATING_EMOJIS[4]}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Slide from rough to great — optional, but helps your weekly rhythm
          score.
        </p>
        {active ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs text-muted-foreground"
            onClick={() => setActive(false)}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function DayRatingDisplay({
  className,
  value,
}: {
  className?: string;
  value: number | null;
}) {
  if (!value || value < 1 || value > 5) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span aria-hidden>{DAY_RATING_EMOJIS[value - 1]}</span>
      <span>{DAY_RATING_LABELS[value - 1]}</span>
    </span>
  );
}
