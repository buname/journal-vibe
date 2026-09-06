"use client";

import * as React from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface CalendarEvent {
  id: string | number;
  name: string;
  time: string;
  datetime: string;
  pnl?: number;
  r?: number;
  symbol?: string;
}

export interface CalendarData {
  day: Date;
  events: CalendarEvent[];
}

export interface FullScreenCalendarProps {
  data: CalendarData[];
  readOnly?: boolean;
  initialMonth?: Date;
  onMonthChange?: (month: Date) => void;
  onNewEvent?: () => void;
  className?: string;
  variant?: "default" | "trading";
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

function eventTone(pnl?: number) {
  if (pnl == null) return "bg-muted/50 text-foreground";
  if (pnl > 0) return "border-primary/20 bg-primary/8 text-foreground";
  if (pnl < 0) return "border-destructive/20 bg-destructive/8 text-foreground";
  return "bg-muted/50 text-foreground";
}

function formatPnl(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString()}`;
}

function getDayData(day: Date, data: CalendarData[]) {
  return data.filter((entry) => isSameDay(entry.day, day));
}

function getDayNetPnl(day: Date, data: CalendarData[]) {
  return getDayData(day, data).reduce(
    (sum, entry) =>
      sum + entry.events.reduce((eventSum, event) => eventSum + (event.pnl ?? 0), 0),
    0,
  );
}

function dayHasPnl(day: Date, data: CalendarData[]) {
  return getDayData(day, data).some((entry) =>
    entry.events.some((event) => event.pnl != null),
  );
}

function getMaxAbsPnl(data: CalendarData[]) {
  let max = 0;
  for (const entry of data) {
    const net = entry.events.reduce((sum, event) => sum + (event.pnl ?? 0), 0);
    max = Math.max(max, Math.abs(net));
  }
  return max;
}

function tradingHeatClass(pnl: number, maxAbs: number) {
  if (!pnl || maxAbs === 0) {
    return "bg-background";
  }

  const ratio = Math.min(1, Math.abs(pnl) / maxAbs);

  if (pnl > 0) {
    if (ratio > 0.66) return "bg-emerald-500/22 border-emerald-500/30";
    if (ratio > 0.33) return "bg-emerald-500/14 border-emerald-500/20";
    return "bg-emerald-500/8 border-emerald-500/15";
  }

  if (ratio > 0.66) return "bg-rose-500/22 border-rose-500/30";
  if (ratio > 0.33) return "bg-rose-500/14 border-rose-500/20";
  return "bg-rose-500/8 border-rose-500/15";
}

export function FullScreenCalendar({
  data,
  readOnly = false,
  initialMonth,
  onMonthChange,
  onNewEvent,
  className,
  variant = "default",
}: FullScreenCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(initialMonth ?? today, "MMM-yyyy"),
  );
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isTrading = variant === "trading";
  const maxAbsPnl = React.useMemo(() => getMaxAbsPnl(data), [data]);
  const desktopDayMinHeight = isTrading ? "min-h-[10.5rem]" : "min-h-[7.5rem]";

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  function setMonth(next: Date) {
    const label = format(next, "MMM-yyyy");
    setCurrentMonth(label);
    onMonthChange?.(next);
  }

  function previousMonth() {
    setMonth(add(firstDayCurrentMonth, { months: -1 }));
  }

  function nextMonth() {
    setMonth(add(firstDayCurrentMonth, { months: 1 }));
  }

  function goToToday() {
    setMonth(today);
    setSelectedDay(today);
  }

  React.useEffect(() => {
    onMonthChange?.(firstDayCurrentMonth);
    // Only on mount for initial month
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderDayPnl(day: Date, compact = false) {
    if (!dayHasPnl(day, data)) return null;

    const net = getDayNetPnl(day, data);

    return (
      <span
        className={cn(
          "font-mono font-semibold tabular-nums",
          compact ? "mt-auto text-[10px] leading-none" : "text-[11px] leading-none",
          net >= 0 ? "text-primary" : "text-destructive",
        )}
      >
        {formatPnl(net)}
      </span>
    );
  }

  function renderDayEvents(day: Date, compact = false) {
    const dayData = getDayData(day, data);

    if (!dayData.length) return null;

    if (compact) {
      return renderDayPnl(day, true);
    }

    return dayData.map((entry) => (
      <div key={entry.day.toString()} className="space-y-1.5">
        {entry.events.slice(0, 2).map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-xs leading-tight w-full",
              eventTone(event.pnl),
            )}
          >
            <p className="font-medium leading-none">{event.name}</p>
            <p
              className={cn(
                "font-mono leading-none",
                event.pnl != null && event.pnl >= 0
                  ? "text-primary"
                  : event.pnl != null
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {event.time}
              {event.r != null ? ` · ${event.r > 0 ? "+" : ""}${event.r}R` : ""}
            </p>
          </div>
        ))}
        {entry.events.length > 2 ? (
          <div className="text-xs text-muted-foreground">
            + {entry.events.length - 2} more
          </div>
        ) : null}
      </div>
    ));
  }

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          {!readOnly ? (
            <>
              <Button variant="outline" size="icon" className="hidden lg:flex">
                <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Separator orientation="vertical" className="hidden h-6 lg:block" />
            </>
          ) : null}

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          {!readOnly ? (
            <>
              <Separator orientation="vertical" className="hidden h-6 md:block" />
              <Separator orientation="horizontal" className="block w-full md:hidden" />
              <Button className="w-full gap-2 md:w-auto" onClick={onNewEvent}>
                <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
                <span>New Event</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className={cn("lg:flex lg:flex-col", isTrading && "px-1.5 pb-2")}>
        <div
          className={cn(
            "grid grid-cols-7 text-center text-xs font-semibold leading-6 lg:flex-none",
            isTrading
              ? "gap-x-2 gap-y-1 px-0.5 pb-2 text-muted-foreground"
              : "border text-center",
          )}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, index) => (
            <div
              key={label}
              className={cn(
                isTrading ? "py-2" : index < 6 ? "border-r py-2.5" : "py-2.5",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex text-xs leading-6 lg:flex-none">
          <div
            className={cn(
              "hidden w-full lg:grid lg:grid-cols-7 lg:auto-rows-min",
              isTrading ? "gap-x-2 gap-y-2" : "border-x",
            )}
          >
            {days.map((day, dayIdx) =>
              !isDesktop ? (
                <button
                  onClick={() => setSelectedDay(day)}
                  key={dayIdx}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-primary-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-muted-foreground",
                    (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  <div className="mt-1 flex w-full justify-end">{renderDayPnl(day, true)}</div>
                </button>
              ) : (
                <div
                  key={dayIdx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      (isTrading
                        ? "bg-muted/20 text-muted-foreground"
                        : "bg-accent/30 text-muted-foreground"),
                    "relative flex flex-col focus:z-10",
                    isTrading
                      ? cn(
                          "rounded-2xl border transition-colors hover:brightness-[1.02]",
                          tradingHeatClass(getDayNetPnl(day, data), maxAbsPnl),
                          desktopDayMinHeight,
                        )
                      : cn(
                          "border-b border-r hover:bg-muted",
                          desktopDayMinHeight,
                          !isEqual(day, selectedDay) && "hover:bg-accent/50",
                        ),
                    isEqual(day, selectedDay) &&
                      isTrading &&
                      "ring-2 ring-primary/35",
                  )}
                >
                  <header className="flex items-center justify-between gap-2 p-3">
                    <button
                      type="button"
                      className={cn(
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-foreground",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-muted-foreground",
                        isEqual(day, selectedDay) && "bg-primary text-primary-foreground",
                        isToday(day) && !isEqual(day, selectedDay) && "ring-1 ring-primary/40",
                        (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs hover:border",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
                    </button>
                    {renderDayPnl(day)}
                  </header>
                  <div className="flex-1 px-3 pb-3 pt-0">{renderDayEvents(day)}</div>
                </div>
              ),
            )}
          </div>

          <div
            className={cn(
              "isolate grid w-full auto-rows-min grid-cols-7 lg:hidden",
              isTrading ? "gap-x-2 gap-y-2 border-0 px-0.5" : "border-x",
            )}
          >
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
                key={dayIdx}
                type="button"
                className={cn(
                  isEqual(day, selectedDay) && "text-primary-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    "text-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-muted-foreground",
                  (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                  isTrading
                    ? cn(
                        "flex min-h-[4.5rem] flex-col rounded-xl border px-2.5 py-2.5",
                        tradingHeatClass(getDayNetPnl(day, data), maxAbsPnl),
                      )
                    : "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </time>
                <div className="mt-1 flex w-full justify-end">{renderDayPnl(day, true)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
