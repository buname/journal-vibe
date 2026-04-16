"use client";

import { useState, useMemo } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  getYear,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarDayData } from "@/lib/utils/tradingCalculations";

type PerformanceCalendarProps = {
  data: Record<string, CalendarDayData>;
};

type ViewMode = "month" | "year";

function intensityClass(pnl: number, maxAbs: number): string {
  if (maxAbs === 0) return "bg-muted";
  const ratio = Math.abs(pnl) / maxAbs;
  if (pnl > 0) {
    if (ratio > 0.66) return "bg-emerald-500/70 dark:bg-emerald-500/50";
    if (ratio > 0.33) return "bg-emerald-400/50 dark:bg-emerald-400/30";
    return "bg-emerald-300/40 dark:bg-emerald-300/20";
  }
  if (ratio > 0.66) return "bg-rose-500/70 dark:bg-rose-500/50";
  if (ratio > 0.33) return "bg-rose-400/50 dark:bg-rose-400/30";
  return "bg-rose-300/40 dark:bg-rose-300/20";
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PerformanceCalendar({ data }: PerformanceCalendarProps) {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const maxAbs = useMemo(() => {
    const vals = Object.values(data).map((d) => Math.abs(d.pnl));
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [data]);

  if (viewMode === "year") {
    const year = getYear(current);
    const months = eachMonthOfInterval({
      start: startOfYear(current),
      end: endOfYear(current),
    });

    return (
      <div className="space-y-3">
        <CalendarNav
          label={String(year)}
          onPrev={() => setCurrent(subMonths(current, 12))}
          onNext={() => setCurrent(addMonths(current, 12))}
          viewMode={viewMode}
          onToggle={() => setViewMode("month")}
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {months.map((month) => {
            const key = format(month, "yyyy-MM");
            const matchingDays = Object.entries(data).filter(([k]) =>
              k.startsWith(key),
            );
            const pnl = matchingDays.reduce(
              (sum, [, d]) => sum + d.pnl,
              0,
            );
            const trades = matchingDays.reduce(
              (sum, [, d]) => sum + d.trades,
              0,
            );
            return (
              <button
                key={key}
                type="button"
                className={cn(
                  "flex flex-col items-center rounded-lg border p-2 text-xs transition-colors hover:bg-accent",
                  trades > 0 && intensityClass(pnl, maxAbs),
                )}
                onClick={() => {
                  setCurrent(month);
                  setViewMode("month");
                }}
              >
                <span className="font-medium">{format(month, "MMM")}</span>
                {trades > 0 ? (
                  <>
                    <span className="tabular-nums">
                      ${Math.round(pnl)}
                    </span>
                    <span className="text-muted-foreground">
                      {trades} trade{trades !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Month view
  const calStart = startOfWeek(startOfMonth(current));
  const calEnd = endOfWeek(endOfMonth(current));
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="space-y-3">
      <CalendarNav
        label={format(current, "MMMM yyyy")}
        onPrev={() => setCurrent(subMonths(current, 1))}
        onNext={() => setCurrent(addMonths(current, 1))}
        viewMode={viewMode}
        onToggle={() => setViewMode("year")}
      />
      <div className="grid grid-cols-7 gap-px text-center text-[0.65rem] text-muted-foreground">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const entry = data[key];
          const inMonth = isSameMonth(day, current);

          return (
            <div
              key={key}
              title={
                entry
                  ? `${key}\nPnL: $${entry.pnl.toFixed(2)}\nTrades: ${entry.trades}`
                  : key
              }
              className={cn(
                "flex min-h-[3rem] flex-col items-center justify-center rounded-md border px-0.5 py-1 text-[0.6rem] transition-colors",
                !inMonth && "opacity-30",
                entry && inMonth && intensityClass(entry.pnl, maxAbs),
                !entry && inMonth && "bg-muted/30",
              )}
            >
              <span className="font-medium tabular-nums">
                {format(day, "d")}
              </span>
              {entry && inMonth ? (
                <>
                  <span className="tabular-nums leading-tight">
                    ${Math.round(entry.pnl)}
                  </span>
                  <span className="text-muted-foreground">
                    {entry.trades}t
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

type CalendarNavProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  viewMode: ViewMode;
  onToggle: () => void;
};

function CalendarNav({
  label,
  onPrev,
  onNext,
  viewMode,
  onToggle,
}: CalendarNavProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onPrev}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[9rem] text-center text-sm font-medium">
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onNext}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-xs"
      >
        {viewMode === "month" ? "Year view" : "Month view"}
      </Button>
    </div>
  );
}
