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

type MiniTradingCalendarProps = {
  data: CalendarData[];
  month: Date;
  onMonthChange: (month: Date) => void;
};

function dayNetPnl(day: Date, data: CalendarData[]) {
  return data
    .filter((entry) => isSameDay(entry.day, day))
    .reduce(
      (sum, entry) =>
        sum + entry.events.reduce((s, event) => s + (event.pnl ?? 0), 0),
      0,
    );
}

function dayTradeCount(day: Date, data: CalendarData[]) {
  return data
    .filter((entry) => isSameDay(entry.day, day))
    .reduce((sum, entry) => sum + entry.events.length, 0);
}

function formatCompactPnl(value: number) {
  const abs = Math.abs(value);
  const body =
    abs >= 1000
      ? `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
      : abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${value >= 0 ? "+" : "-"}$${body}`;
}

function heatClass(pnl: number, maxAbs: number) {
  if (!pnl || maxAbs === 0) return "bg-background";
  const ratio = Math.min(1, Math.abs(pnl) / maxAbs);
  if (pnl > 0) {
    if (ratio > 0.66) return "bg-emerald-500/25 border-emerald-500/35";
    if (ratio > 0.33) return "bg-emerald-500/15 border-emerald-500/25";
    return "bg-emerald-500/8 border-emerald-500/18";
  }
  if (ratio > 0.66) return "bg-rose-500/25 border-rose-500/35";
  if (ratio > 0.33) return "bg-rose-500/15 border-rose-500/25";
  return "bg-rose-500/8 border-rose-500/18";
}

export function MiniTradingCalendar({
  data,
  month,
  onMonthChange,
}: MiniTradingCalendarProps) {
  const monthStart = startOfMonth(month);
  const [selected, setSelected] = useState(() => new Date());

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
      const net = entry.events.reduce((s, e) => s + (e.pnl ?? 0), 0);
      max = Math.max(max, Math.abs(net));
    }
    return max;
  }, [data]);

  const selectedNet = dayNetPnl(selected, data);
  const selectedCount = dayTradeCount(selected, data);

  return (
    <div className="space-y-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {format(monthStart, "MMMM yyyy")}
          </h3>
          {isSameMonth(selected, monthStart) && selectedCount > 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(selected, "MMM d")} · {selectedCount} trade
              {selectedCount === 1 ? "" : "s"} ·{" "}
              <span
                className={cn(
                  "font-medium tabular-nums",
                  selectedNet >= 0 ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {formatCompactPnl(selectedNet)}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Daily PnL</p>
          )}
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
        {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => (
          <div key={`${label}-${i}`} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const net = dayNetPnl(day, data);
          const count = dayTradeCount(day, data);
          const hasPnl = count > 0;
          const active = isSameDay(day, selected);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelected(day)}
              className={cn(
                "flex aspect-square flex-col items-stretch rounded-md border p-1 text-left transition-colors",
                !inMonth && "opacity-35",
                hasPnl
                  ? heatClass(net, maxAbs)
                  : "border-border/50 bg-muted/15 hover:bg-muted/30",
                active && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
                isToday(day) && !active && "border-primary/40",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium leading-none tabular-nums",
                  isToday(day) ? "text-primary" : "text-muted-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              {hasPnl ? (
                <span
                  className={cn(
                    "mt-auto text-[9px] font-semibold leading-tight tabular-nums sm:text-[10px]",
                    net >= 0 ? "text-emerald-700" : "text-rose-700",
                  )}
                >
                  {formatCompactPnl(net)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
