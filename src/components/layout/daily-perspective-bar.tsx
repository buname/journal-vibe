"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { DAILY_QUOTES } from "@/data/daily-quotes";
import { getQuotePeriodKey, pickDailyQuote } from "@/lib/daily-quote";

function useQuotePeriodKey(): string | null {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setKey(getQuotePeriodKey(new Date()));
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return key;
}

export function DailyPerspectiveBar() {
  const periodKey = useQuotePeriodKey();
  const quote =
    periodKey === null ? null : pickDailyQuote(DAILY_QUOTES, periodKey);

  return (
    <div className="border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-5xl items-start gap-2.5 px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5">
        <div
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-foreground shadow-sm sm:size-10 sm:rounded-2xl"
          aria-hidden
        >
          <Sparkles className="size-4 sm:size-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px] sm:tracking-[0.2em]">
            Daily perspective
          </span>
          {quote ? (
            <p className="min-w-0 font-sans text-sm font-bold leading-snug tracking-tight text-foreground antialiased sm:text-base">
              {quote.text}
              {quote.author ? (
                <span className="mt-1 block text-xs font-semibold text-muted-foreground sm:ml-2 sm:mt-0 sm:inline sm:text-sm">
                  — {quote.author}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="min-h-[1.25rem] font-sans text-sm font-medium text-muted-foreground/80 sm:text-[15px]">
              Loading today&apos;s line…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
