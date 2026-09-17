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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  if (!hasTrades) return "bg-background";
  if (!pnl || maxAbs === 0) return "bg-muted/40";
  const ratio = Math.min(1, Math.abs(pnl) / maxAbs);
  if (pnl > 0) {
    if (ratio > 0.66) return "bg-emerald-500/35";
    if (ratio > 0.33) return "bg-emerald-500/22";
    return "bg-emerald-500/12";
  }
  if (ratio > 0.66) return "bg-rose-500/35";
  if (ratio > 0.33) return "bg-rose-500/22";
  return "bg-rose-500/12";
}

export function PnlCalendar({
  data,
  month,
  onMonthChange,
  className,
}: PnlCalendarProps) {
  const reduce = useReducedMotion();
  const monthStart = startOfMonth(month);
  const [selected, setSelected] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);

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
  const monthKey = format(monthStart, "yyyy-MM");

  function goPrev() {
    setDirection(-1);
    onMonthChange(subMonths(monthStart, 1));
  }

  function goNext() {
    setDirection(1);
    onMonthChange(addMonths(monthStart, 1));
  }

  function goToday() {
    setDirection(0);
    const now = new Date();
    onMonthChange(startOfMonth(now));
    setSelected(now);
  }

  return (
    <div className={cn("space-y-3 p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={monthKey}
              initial={reduce ? false : { opacity: 0, y: direction >= 0 ? 8 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: direction >= 0 ? -8 : 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm font-semibold tracking-tight sm:text-base"
            >
              {format(monthStart, "MMMM yyyy")}
            </motion.h3>
          </AnimatePresence>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Daily net PnL
          </p>
        </div>
        <div className="inline-flex shrink-0 -space-x-px rounded-md shadow-sm">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-none first:rounded-s-md"
            onClick={goPrev}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-none px-2.5 text-xs"
            onClick={goToday}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-none last:rounded-e-md"
            onClick={goNext}
            aria-label="Next month"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <div
              key={label}
              className="border-r border-border py-2 last:border-r-0"
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.charAt(0)}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={monthKey}
            initial={
              reduce
                ? false
                : { opacity: 0, x: direction === 0 ? 0 : direction > 0 ? 28 : -28 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduce
                ? undefined
                : { opacity: 0, x: direction === 0 ? 0 : direction > 0 ? -28 : 28 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7 gap-0 [&>button]:-mb-px [&>button]:-mr-px [&>button]:border [&>button]:border-border"
          >
            {days.map((day, index) => {
              const inMonth = isSameMonth(day, monthStart);
              const { pnl, count } = dayStats(day, data);
              const hasTrades = count > 0;
              const active = selected ? isSameDay(day, selected) : false;

              return (
                <motion.button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  whileTap={reduce ? undefined : { scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={cn(
                    "relative flex min-h-[3.6rem] flex-col rounded-none p-1.5 text-left transition-colors sm:min-h-[4.5rem] sm:p-2",
                    !inMonth && "bg-muted/25 text-muted-foreground",
                    heatClass(pnl, maxAbs, hasTrades && inMonth),
                    !hasTrades && inMonth && "hover:bg-muted/35",
                    active && "z-[1] ring-2 ring-inset ring-primary/50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums sm:size-6 sm:text-[11px]",
                      isToday(day)
                        ? "bg-primary text-primary-foreground"
                        : inMonth
                          ? "text-foreground/80"
                          : "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {hasTrades && inMonth ? (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.02 * (index % 7) }}
                      className="mt-auto space-y-0.5"
                    >
                      <p
                        className={cn(
                          "text-[10px] font-bold leading-none tabular-nums sm:text-xs",
                          pnl >= 0 ? "text-emerald-700" : "text-rose-700",
                        )}
                      >
                        {formatPnl(pnl)}
                      </p>
                      <p className="text-[9px] leading-none text-muted-foreground sm:text-[10px]">
                        {count} fill{count === 1 ? "" : "s"}
                      </p>
                    </motion.div>
                  ) : null}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {selectedStats && selectedStats.count > 0 && selected ? (
          <motion.div
            key={selected.toISOString()}
            initial={reduce ? false : { opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
          >
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
                      (event.pnl ?? 0) >= 0
                        ? "text-emerald-600"
                        : "text-rose-600",
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
