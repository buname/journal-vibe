"use client";

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
    <div className="border-t border-border/70 bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Daily perspective
        </span>
        {quote ? (
          <p className="min-w-0 font-quote text-[15px] font-semibold leading-relaxed tracking-tight text-foreground">
            <span className="text-foreground/95">{quote.text}</span>
            {quote.author ? (
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                — {quote.author}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="min-h-[1.5rem] font-quote text-[15px] font-semibold text-muted-foreground/80">
            Loading today&apos;s line…
          </p>
        )}
      </div>
    </div>
  );
}
