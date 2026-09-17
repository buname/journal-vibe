"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { CalendarData } from "@/components/ui/fullscreen-calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PnlCalendarProps = {
  data: CalendarData[];
  month: Date;
  onMonthChange: (month: Date) => void;
  className?: string;
};

function toDay(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function dayStats(day: Date, data: CalendarData[]) {
  const events = data
    .filter((entry) => {
      const entryDay = toDay(entry.day);
      return !Number.isNaN(entryDay.getTime()) && isSameDay(entryDay, day);
    })
    .flatMap((entry) => entry.events);

  const pnl = events.reduce((sum, event) => sum + (event.pnl ?? 0), 0);
  const r = events.reduce((sum, event) => sum + (event.r ?? 0), 0);
  return { events, pnl, r, count: events.length };
}

function formatPnl(value: number) {
  const abs = Math.abs(value);
  const body =
    abs >= 1000
      ? `${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1)}k`
      : abs.toLocaleString(undefined, {
          minimumFractionDigits: abs < 100 ? 2 : 0,
          maximumFractionDigits: abs < 100 ? 2 : 0,
        });
  return `${value >= 0 ? "+" : "-"}$${body}`;
}

function heatClass(pnl: number, maxAbs: number, hasTrades: boolean) {
  if (!hasTrades || !pnl || maxAbs === 0) {
    return "bg-background border-border/60";
  }
  const ratio = Math.min(1, Math.abs(pnl) / maxAbs);
  if (pnl > 0) {
    if (ratio > 0.66) return "bg-emerald-500/30 border-emerald-500/40";
    if (ratio > 0.33) return "bg-emerald-500/18 border-emerald-500/30";
    return "bg-emerald-500/10 border-emerald-500/22";
  }
  if (ratio > 0.66) return "bg-rose-500/30 border-rose-500/40";
  if (ratio > 0.33) return "bg-rose-500/18 border-rose-500/30";
  return "bg-rose-500/10 border-rose-500/22";
}

/**
 * Topstep-style daily PnL month calendar — compact heat cells that fit the screen.
 * Not an event scheduler.
 */
export function PnlCalendar({
  data,
  month,
  onMonthChange,
  className,
}: PnlCalendarProps) {
  const monthStart = startOfMonth(month);
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(monthStart),
        end: endOfWeek(endOfMonth(monthStart)),
      }),
    [monthStart],
  );

  const maxAbs = useMemo(() => {
    let max = 0;
    for (const entry of data) {
      const net = entry.events.reduce((sum, event) => sum + (event.pnl ?? 0), 0);
      max = Math.max(max, Math.abs(net));
    }
    return max || 1;
  }, [data]);

  const selectedStats = selected ? dayStats(selected, data) : null;

  return (
    <div className={cn("space-y-3 p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight sm:text-base">
            {format(monthStart, "MMMM yyyy")}
          </h3>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Daily net PnL · Topstep-style heat map
          </p>
        </div>
        <div className="inline-flex shrink-0 -space-x-px rounded-md shadow-sm">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-none first:rounded-s-md"
            onClick={() => onMonthChange(subMonths(monthStart, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-none px-2.5 text-xs"
            onClick={() => {
              const now = new Date();
              onMonthChange(startOfMonth(now));
              setSelected(now);
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-none last:rounded-e-md"
            onClick={() => onMonthChange(addMonths(monthStart, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <div key={`${label}-${index}`} className="py-0.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const { pnl, count } = dayStats(day, data);
          const hasTrades = count > 0;
          const active = selected ? isSameDay(day, selected) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelected(day)}
              className={cn(
                "flex aspect-[1/1.05] max-h-[4.75rem] flex-col rounded-md border p-1 text-left transition-colors sm:max-h-[5.25rem] sm:p-1.5",
                !inMonth && "opacity-35",
                heatClass(pnl, maxAbs, hasTrades),
                !hasTrades && "hover:bg-muted/40",
                active && "ring-2 ring-primary/45 ring-offset-1 ring-offset-background",
                isToday(day) && !active && "border-primary/50",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium leading-none tabular-nums sm:text-[11px]",
                  isToday(day)
                    ? "flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {format(day, "d")}
              </span>

              {hasTrades ? (
                <div className="mt-auto space-y-0.5">
                  <p
                    className={cn(
                      "text-[9px] font-bold leading-tight tabular-nums sm:text-[11px]",
                      pnl >= 0 ? "text-emerald-700" : "text-rose-700",
                    )}
                  >
                    {formatPnl(pnl)}
                  </p>
                  <p className="text-[9px] leading-none text-muted-foreground">
                    {count} fill{count === 1 ? "" : "s"}
                  </p>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedStats && selectedStats.count > 0 && selected ? (
        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-semibold">
              {format(selected, "EEE, MMM d")}
            </p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                selectedStats.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {formatPnl(selectedStats.pnl)}
              {selectedStats.r !== 0 ? (
                <span className="ml-2 text-xs font-semibold">
                  {selectedStats.r >= 0 ? "+" : ""}
                  {selectedStats.r.toFixed(2)}R
                </span>
              ) : null}
            </p>
          </div>
          <ul className="mt-2 space-y-1">
            {selectedStats.events.map((event) => (
              <li
                key={String(event.id)}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="font-medium">{event.name}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    (event.pnl ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {event.time}
                  {event.r != null
                    ? ` · ${event.r >= 0 ? "+" : ""}${event.r}R`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
