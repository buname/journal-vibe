"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  addDays,
  addYears,
  eachDayOfInterval,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { parseLocalDate, toDayKey } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface HeatmapDay {
  date: string;
  count: number;
  journal?: number;
  trade?: number;
  backtest?: number;
}

/** @deprecated Use HeatmapDay */
export type ContributionDay = HeatmapDay;

export interface ActivityHeatmapProps {
  data: HeatmapDay[];
  colors?: string[];
  className?: string;
  entryLabel?: string;
}

const GAP = 3;
const DAY_LABEL_W = 30;
const MONTH_ROW_H = 18;
const TOOLTIP_HEADROOM = 8;
const TOOLTIP_CURSOR_OFFSET_X = 14;
const TOOLTIP_CURSOR_OFFSET_Y = 10;
const WEEK_STARTS_ON = 0 as const;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const GITHUB_HEATMAP_COLORS = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
] as const;

export const BRAND_HEATMAP_COLORS = [
  "#eef2f6",
  "#d4e4f4",
  "#a8c4e8",
  "#6b96c4",
  "#3d5a80",
] as const;

function getColor(count: number, colors: string[]) {
  if (count === 0) return colors[0];
  if (count === 1) return colors[1];
  if (count === 2) return colors[2];
  if (count === 3) return colors[3];
  return colors[4] ?? colors[colors.length - 1];
}

function heatmapRow(day: Date) {
  return day.getDay() + 2;
}

function isInRange(day: Date, rangeStart: Date, rangeEnd: Date) {
  const dayStart = startOfDay(day);
  return !isBefore(dayStart, rangeStart) && !isAfter(dayStart, rangeEnd);
}

function buildMonthMarkers(
  weeks: Date[][],
  rangeStart: Date,
  rangeEnd: Date,
) {
  if (weeks.length === 0) {
    return [];
  }

  const markers: {
    key: string;
    label: string;
    weekIndex: number;
    markerDate: Date;
  }[] = [];
  const seen = new Set<string>();

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    for (const day of weeks[weekIndex]) {
      if (!isInRange(day, rangeStart, rangeEnd)) continue;
      if (day.getDate() !== 1) continue;

      const key = format(day, "yyyy-MM");
      if (seen.has(key)) continue;
      seen.add(key);
      markers.push({
        key,
        label: format(day, "MMM"),
        weekIndex,
        markerDate: day,
      });
      break;
    }
  }

  const firstWeekIndex = weeks.findIndex((week) =>
    week.some((day) => isInRange(day, rangeStart, rangeEnd)),
  );

  if (firstWeekIndex >= 0) {
    const firstDay = weeks
      .flat()
      .find((day) => isInRange(day, rangeStart, rangeEnd));

    if (firstDay) {
      const leadKey = `lead-${format(firstDay, "yyyy-MM")}`;
      const hasLead = markers.some(
        (marker) => marker.weekIndex === firstWeekIndex,
      );

      if (!hasLead) {
        markers.push({
          key: leadKey,
          label: format(firstDay, "MMM"),
          weekIndex: firstWeekIndex,
          markerDate: firstDay,
        });
      }
    }
  }

  const sorted = markers
    .sort((a, b) => a.weekIndex - b.weekIndex)
    .filter((marker, index, all) => {
      if (index === 0) return true;
      return marker.weekIndex - all[index - 1].weekIndex >= 1;
    });

  let lastYear: number | null = null;
  return sorted.map((marker) => {
    const year = marker.markerDate.getFullYear();
    const label =
      lastYear !== null && year !== lastYear
        ? format(marker.markerDate, "MMM ''yy")
        : format(marker.markerDate, "MMM");
    lastYear = year;
    return { key: marker.key, label, weekIndex: marker.weekIndex };
  });
}

function buildWeeks(today: Date) {
  const normalizedToday = startOfDay(today);
  const rangeStart = startOfMonth(normalizedToday);
  const rangeEnd = endOfYear(addYears(normalizedToday, 1));
  const firstWeekStart = startOfWeek(rangeStart, {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const lastWeekStart = startOfWeek(
    endOfWeek(rangeEnd, { weekStartsOn: WEEK_STARTS_ON }),
    { weekStartsOn: WEEK_STARTS_ON },
  );

  const result: Date[][] = [];
  let cursor = firstWeekStart;

  while (cursor <= lastWeekStart) {
    const weekStart = startOfDay(cursor);
    result.push(
      eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: WEEK_STARTS_ON }),
      }),
    );
    cursor = addDays(cursor, 7);
  }

  return { weeks: result, rangeStart, rangeEnd };
}

type TooltipAnchor = {
  key: string;
  x: number;
  y: number;
};

function HeatmapTooltip({
  day,
  contribution,
  entryLabel,
  anchor,
  accentColor,
  isFuture,
}: {
  day: Date;
  contribution: HeatmapDay | undefined;
  entryLabel: string;
  anchor: TooltipAnchor;
  accentColor: string;
  isFuture: boolean;
}) {
  const count = contribution?.count ?? 0;
  const breakdown = [
    contribution?.journal
      ? { label: "journal", value: contribution.journal }
      : null,
    contribution?.trade ? { label: "trades", value: contribution.trade } : null,
    contribution?.backtest
      ? { label: "backtests", value: contribution.backtest }
      : null,
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      style={{
        left: anchor.x + TOOLTIP_CURSOR_OFFSET_X,
        top: anchor.y - TOOLTIP_CURSOR_OFFSET_Y,
        transform: "translate(0, -100%)",
      }}
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 4 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
    >
      <div className="relative min-w-[9.5rem] overflow-hidden rounded-xl border border-border/80 bg-card px-3 py-2.5 shadow-[0_12px_40px_-16px_rgba(61,90,128,0.35)] backdrop-blur-md">
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: accentColor }}
        />
        <p className="text-[11px] font-medium text-foreground">
          {format(day, "EEEE")}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {format(day, "MMM d, yyyy")}
        </p>
        {isFuture ? (
          <p className="mt-2 text-[10px] text-muted-foreground">Upcoming day</p>
        ) : (
          <>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
                {count}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {entryLabel}
              </span>
            </div>
            {breakdown.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {breakdown.map((item) => (
                  <span
                    key={item.label}
                    className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {item.value} {item.label}
                  </span>
                ))}
              </div>
            ) : count === 0 ? (
              <p className="mt-2 text-[10px] text-muted-foreground">No activity</p>
            ) : null}
          </>
        )}
        <div
          className="absolute -bottom-1.5 left-3 size-2.5 rotate-45 border-b border-r border-border/80 bg-card"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

export function ActivityHeatmap({
  data,
  colors = [...BRAND_HEATMAP_COLORS],
  className,
  entryLabel = "touchpoints",
}: ActivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(11);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<TooltipAnchor | null>(null);
  const reduce = useReducedMotion();

  const { weeks, rangeStart, rangeEnd } = useMemo(
    () =>
      today
        ? buildWeeks(today)
        : { weeks: [] as Date[][], rangeStart: null, rangeEnd: null },
    [today],
  );

  const weekCount = weeks.length;
  const todayKey = today ? toDayKey(today) : null;
  const monthMarkers = useMemo(
    () =>
      weeks.length > 0 && rangeStart && rangeEnd
        ? buildMonthMarkers(weeks, rangeStart, rangeEnd)
        : [],
    [weeks, rangeStart, rangeEnd],
  );

  const dataByDay = useMemo(() => {
    const map = new Map<string, HeatmapDay>();
    for (const item of data) {
      map.set(item.date, item);
    }
    return map;
  }, [data]);

  useEffect(() => {
    setToday(startOfDay(new Date()));
    setMounted(true);
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      const width = node.clientWidth - DAY_LABEL_W - 12;
      const columns = Math.max(weekCount, 1);
      const fromWidth = Math.floor((width - (columns - 1) * GAP) / columns);
      setCellSize(Math.max(10, Math.min(fromWidth, 16)));
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [weekCount]);

  useEffect(() => {
    if (!mounted || !scrollRef.current) return;
    scrollRef.current.scrollLeft = 0;
  }, [mounted, weekCount, cellSize]);

  const gridStyle = {
    gridTemplateColumns: `${DAY_LABEL_W}px repeat(${Math.max(weekCount, 1)}, ${cellSize}px)`,
    gridTemplateRows: `${MONTH_ROW_H}px repeat(7, ${cellSize}px)`,
    gap: `${GAP}px`,
    width: "max-content",
    minWidth: "100%",
  } as const;

  const hoveredDay = hovered ? parseLocalDate(hovered) : null;
  const hoveredContribution = hovered ? dataByDay.get(hovered) : null;
  const hoveredColor =
    hoveredContribution && hoveredContribution.count > 0
      ? getColor(hoveredContribution.count, colors)
      : colors[0];

  if (!today || weeks.length === 0 || !rangeStart || !rangeEnd) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ minHeight: MONTH_ROW_H + 7 * cellSize + 6 * GAP }}
      />
    );
  }

  const placeTooltip = (key: string, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    setHovered(key);
    setTooltipAnchor({
      key,
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });
  };

  const showCellTooltip = (key: string, event: MouseEvent<HTMLElement>) => {
    placeTooltip(key, event.clientX, event.clientY);
  };

  const moveCellTooltip = (key: string, event: MouseEvent<HTMLElement>) => {
    placeTooltip(key, event.clientX, event.clientY);
  };

  const showCellTooltipFromFocus = (
    key: string,
    element: HTMLElement,
  ) => {
    const rect = element.getBoundingClientRect();
    placeTooltip(key, rect.right, rect.top);
  };

  const clearCellTooltip = () => {
    setHovered(null);
    setTooltipAnchor(null);
  };

  const hoveredIsFuture =
    hoveredDay && today ? isAfter(startOfDay(hoveredDay), today) : false;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className="relative min-w-0 overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: TOOLTIP_HEADROOM }}
        onScroll={clearCellTooltip}
      >
        <div ref={gridRef} className="relative grid" style={gridStyle}>
          <div style={{ gridColumn: 1, gridRow: 1 }} aria-hidden />

          {monthMarkers.map((month) => (
            <div
              key={month.key}
              className="self-end whitespace-nowrap text-[10px] leading-none text-muted-foreground"
              style={{
                gridColumn: month.weekIndex + 2,
                gridRow: 1,
              }}
            >
              {month.label}
            </div>
          ))}

          {DAY_LABELS.map((label, dayIndex) => (
            <div
              key={`${label}-${dayIndex}`}
              className="flex items-center justify-end pr-1 text-[10px] leading-none text-muted-foreground"
              style={{
                gridColumn: 1,
                gridRow: dayIndex + 2,
              }}
            >
              {dayIndex === 1 || dayIndex === 3 || dayIndex === 5 || dayIndex === 6
                ? label
                : ""}
            </div>
          ))}

          {weeks.map((weekDays, weekIndex) =>
            weekDays.map((day) => {
              const key = toDayKey(day);
              const dayStart = startOfDay(day);
              const inRange = isInRange(dayStart, rangeStart, rangeEnd);
              const dayRow = heatmapRow(day);

              if (!inRange) {
                return (
                  <div
                    key={`${weekIndex}-${key}-pad`}
                    aria-hidden
                    className="pointer-events-none"
                    style={{
                      gridColumn: weekIndex + 2,
                      gridRow: dayRow,
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                );
              }

              const contribution = dataByDay.get(key);
              const count = contribution?.count ?? 0;
              const isToday = key === todayKey;
              const isFuture = isAfter(dayStart, today);
              const color = isFuture ? colors[0] : getColor(count, colors);
              const isHovered = hovered === key;
              const hasActivity = count > 0 && !isFuture;
              const delay = weekIndex * 0.005 + day.getDay() * 0.002;

              const cell = (
                <button
                  type="button"
                  className="block rounded-[4px] border-0 p-0 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: color,
                    opacity: isFuture ? 0.35 : 1,
                    boxShadow: isToday
                      ? "0 0 0 2px hsl(var(--foreground) / 0.55)"
                      : isHovered
                        ? hasActivity
                          ? `0 0 0 2px ${color}, 0 0 10px ${color}70`
                          : "0 0 0 2px hsl(var(--border))"
                        : undefined,
                  }}
                  aria-label={`${format(day, "EEEE, MMM d, yyyy")}: ${count} ${entryLabel}`}
                  onMouseEnter={(event) => showCellTooltip(key, event)}
                  onMouseMove={(event) => moveCellTooltip(key, event)}
                  onMouseLeave={clearCellTooltip}
                  onFocus={(event) =>
                    showCellTooltipFromFocus(key, event.currentTarget)
                  }
                  onBlur={clearCellTooltip}
                />
              );

              const wrapper =
                !mounted || reduce ? (
                  cell
                ) : (
                  <motion.div
                    className="size-full"
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.12 }}
                    transition={{
                      opacity: { duration: 0.2, delay, ease: [0.16, 1, 0.3, 1] },
                      scale: {
                        duration: 0.2,
                        delay,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                  >
                    {cell}
                  </motion.div>
                );

              return (
                <div
                  key={`${weekIndex}-${key}`}
                  style={{
                    gridColumn: weekIndex + 2,
                    gridRow: dayRow,
                    width: cellSize,
                    height: cellSize,
                  }}
                >
                  {wrapper}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <AnimatePresence>
        {tooltipAnchor && hoveredDay ? (
          <HeatmapTooltip
            key={tooltipAnchor.key}
            day={hoveredDay}
            contribution={hoveredContribution}
            entryLabel={entryLabel}
            anchor={tooltipAnchor}
            accentColor={hoveredColor}
            isFuture={hoveredIsFuture}
          />
        ) : null}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {colors.map((color) => (
          <div
            key={color}
            className="rounded-[4px]"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: color,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/** @deprecated Use ActivityHeatmap */
export const GitHubCalendar = ActivityHeatmap;

/** @deprecated Use ActivityHeatmapProps */
export type GitHubCalendarProps = ActivityHeatmapProps;
