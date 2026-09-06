"use client";

import * as React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  symbol?: string;
  pnl?: number;
  r?: number;
};

export interface ThreeDWallCalendarProps {
  events: CalendarEvent[];
  onAddEvent?: (event: CalendarEvent) => void;
  onRemoveEvent?: (id: string) => void;
  panelWidth?: number;
  panelHeight?: number;
  columns?: number;
  readOnly?: boolean;
  demoAnimation?: boolean;
  initialMonth?: Date;
  className?: string;
}

function newEventId() {
  return crypto.randomUUID();
}

function formatPnl(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString()}`;
}

function eventHasPnl(events: CalendarEvent[]) {
  return events.some((event) => event.pnl != null);
}

function DayCell({
  day,
  dayEvents,
  net,
  readOnly,
  onRemoveEvent,
  panelWidth,
  animate = false,
  index = 0,
}: {
  day: Date;
  dayEvents: CalendarEvent[];
  net: number;
  readOnly: boolean;
  onRemoveEvent?: (id: string) => void;
  panelWidth?: number;
  animate?: boolean;
  index?: number;
}) {
  const dayKey = format(day, "yyyy-MM-dd");
  const content = (
    <Card
      data-day={dayKey}
      className={cn(
        "h-full overflow-visible border-border/60 shadow-sm transition-shadow duration-200",
        net > 0 && "border-primary/25 bg-primary/[0.04]",
        net < 0 && "border-destructive/20 bg-destructive/[0.03]",
        !dayEvents.length && "bg-card",
      )}
    >
      <CardContent className="flex h-full min-h-[5.5rem] flex-col p-2 sm:min-h-[6rem] sm:p-2.5">
        <div className="flex items-start justify-between">
          <div className="text-xs font-semibold">{format(day, "d")}</div>
          <div className="text-[10px] text-muted-foreground">{format(day, "EEE")}</div>
        </div>

        <div className="relative mt-1.5 min-h-[2rem] flex-1 sm:min-h-[2.5rem]">
          {dayEvents.map((event, eventIndex) => {
            const width = panelWidth ?? 120;
            const left = 4 + (eventIndex * 24) % (width - 28);
            const top = 4 + Math.floor((eventIndex * 24) / (width - 28)) * 22;
            const positive = (event.pnl ?? 0) >= 0;

            return (
              <HoverCard key={event.id} openDelay={80} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "absolute flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-white shadow-sm sm:h-6 sm:w-6 sm:text-[9px]",
                      positive
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-destructive hover:bg-destructive/90",
                    )}
                    style={{ left, top }}
                    aria-label={`${event.title} ${event.pnl != null ? formatPnl(event.pnl) : ""}`}
                  >
                    {event.symbol?.slice(0, 2) ?? "•"}
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-52 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{event.title}</p>
                    {event.symbol ? (
                      <p className="text-muted-foreground">{event.symbol}</p>
                    ) : null}
                    {event.pnl != null ? (
                      <p
                        className={cn(
                          "font-mono font-medium",
                          event.pnl >= 0 ? "text-primary" : "text-destructive",
                        )}
                      >
                        {formatPnl(event.pnl)}
                        {event.r != null ? ` · ${event.r > 0 ? "+" : ""}${event.r}R` : ""}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground">
                      {format(new Date(event.date), "PPP")}
                    </p>
                    {!readOnly && onRemoveEvent ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 w-full text-destructive hover:text-destructive"
                        onClick={() => onRemoveEvent(event.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">
            {dayEvents.length} fill{dayEvents.length === 1 ? "" : "s"}
          </span>
          {dayEvents.length > 0 && eventHasPnl(dayEvents) ? (
            <span
              className={cn(
                "font-mono font-semibold",
                net >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {formatPnl(net)}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4% 0px" }}
      transition={{ duration: 0.45, delay: (index % 7) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {content}
    </motion.div>
  );
}

function CalendarDemoCursor({
  containerRef,
  targetDay,
  demoEvent,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  targetDay: string;
  demoEvent?: CalendarEvent;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [target, setTarget] = React.useState<{ x: number; y: number } | null>(null);
  const [showJournal, setShowJournal] = React.useState(false);
  const [clickPulse, setClickPulse] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready || reduce || !containerRef.current) return;

    const measure = () => {
      const cell = containerRef.current?.querySelector(
        `[data-day="${targetDay}"]`,
      ) as HTMLElement | null;
      if (!cell || !containerRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const rect = cell.getBoundingClientRect();
      setTarget({
        x: rect.left - container.left + rect.width * 0.65,
        y: rect.top - container.top + rect.height * 0.55,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [containerRef, targetDay, ready, reduce]);

  React.useEffect(() => {
    if (!target || reduce) return;

    const clickTimer = window.setTimeout(() => setClickPulse(true), 2200);
    const journalTimer = window.setTimeout(() => setShowJournal(true), 2500);

    return () => {
      window.clearTimeout(clickTimer);
      window.clearTimeout(journalTimer);
    };
  }, [target, reduce]);

  if (!ready || reduce || !target || !demoEvent) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none absolute z-30"
        initial={{ left: target.x - 120, top: target.y - 80, opacity: 0 }}
        animate={{
          left: [target.x - 120, target.x - 40, target.x],
          top: [target.y - 80, target.y - 20, target.y],
          opacity: [0, 1, 1],
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], times: [0, 0.7, 1] }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-md">
          <path
            d="M5.5 3.5l12 8.5-5.5 1.5 2 6.5-2 1-3.5-7-3.5 1.5z"
            fill="#1a2433"
            stroke="#fff"
            strokeWidth="1.2"
          />
        </svg>
      </motion.div>

      {clickPulse ? (
        <motion.span
          className="pointer-events-none absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/50 bg-primary/10"
          style={{ left: target.x, top: target.y }}
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ) : null}

      {showJournal ? (
        <motion.div
          className="pointer-events-none absolute z-40 w-52 rounded-xl border border-border/70 bg-card p-3 shadow-lg"
          style={{ left: Math.min(target.x + 12, 180), top: target.y - 20 }}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold">{demoEvent.title}</p>
          <p className="mt-1 font-mono text-xs text-primary">
            {demoEvent.pnl != null ? formatPnl(demoEvent.pnl) : ""}
            {demoEvent.r != null ? ` · ${demoEvent.r > 0 ? "+" : ""}${demoEvent.r}R` : ""}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Opened the journal for this session — notes, fills, and review in one place.
          </p>
        </motion.div>
      ) : null}
    </>
  );
}

function FlatMonthCalendar({
  days,
  columns,
  events,
  readOnly,
  onRemoveEvent,
  demoAnimation,
  demoTargetDay,
  demoEvent,
}: {
  days: Date[];
  columns: number;
  events: CalendarEvent[];
  readOnly: boolean;
  onRemoveEvent?: (id: string) => void;
  demoAnimation?: boolean;
  demoTargetDay?: string;
  demoEvent?: CalendarEvent;
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const eventsForDay = (day: Date) =>
    events.filter(
      (event) =>
        format(new Date(event.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    );

  const dayNetPnl = (dayEvents: CalendarEvent[]) =>
    dayEvents.reduce((sum, event) => sum + (event.pnl ?? 0), 0);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-background/60 p-3">
      <div
        ref={gridRef}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {days.map((day, index) => {
          const dayEvents = eventsForDay(day);
          const net = dayNetPnl(dayEvents);

          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              dayEvents={dayEvents}
              net={net}
              readOnly={readOnly}
              onRemoveEvent={onRemoveEvent}
              animate={mounted}
              index={index}
            />
          );
        })}
      </div>

      {demoAnimation && demoTargetDay && mounted ? (
        <CalendarDemoCursor
          containerRef={gridRef}
          targetDay={demoTargetDay}
          demoEvent={demoEvent}
        />
      ) : null}
    </div>
  );
}

export function ThreeDWallCalendar({
  events,
  onAddEvent,
  onRemoveEvent,
  panelWidth = 132,
  panelHeight = 108,
  columns = 7,
  readOnly = false,
  demoAnimation = false,
  initialMonth,
  className,
}: ThreeDWallCalendarProps) {
  const [dateRef, setDateRef] = React.useState<Date>(initialMonth ?? new Date());
  const [title, setTitle] = React.useState("");
  const [newDate, setNewDate] = React.useState("");
  const [tiltX, setTiltX] = React.useState(18);
  const [tiltY, setTiltY] = React.useState(0);
  const isDragging = React.useRef(false);
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);

  const days = eachDayOfInterval({
    start: startOfMonth(dateRef),
    end: endOfMonth(dateRef),
  });

  const eventsForDay = (day: Date) =>
    events.filter(
      (event) =>
        format(new Date(event.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    );

  const dayNetPnl = (dayEvents: CalendarEvent[]) =>
    dayEvents.reduce((sum, event) => sum + (event.pnl ?? 0), 0);

  const handleAdd = () => {
    if (!title.trim() || !newDate) return;
    onAddEvent?.({
      id: newEventId(),
      title: title.trim(),
      date: new Date(newDate).toISOString(),
    });
    setTitle("");
    setNewDate("");
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setTiltX((value) => Math.max(0, Math.min(50, value + e.deltaY * 0.02)));
    setTiltY((value) => Math.max(-45, Math.min(45, value + e.deltaX * 0.05)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTiltY((value) => Math.max(-60, Math.min(60, value + dx * 0.1)));
    setTiltX((value) => Math.max(0, Math.min(60, value - dy * 0.1)));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isDragging.current = false;
    dragStart.current = null;
  };

  const demoEvent = events.find((event) => event.id === "s4");
  const demoTargetDay = demoEvent
    ? format(new Date(demoEvent.date), "yyyy-MM-dd")
    : undefined;

  const gap = 10;
  const rowCount = Math.ceil(days.length / columns);
  const wallCenterRow = (rowCount - 1) / 2;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setDateRef((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))
          }
        >
          Prev
        </Button>
        <div className="min-w-[9rem] text-center text-sm font-semibold">
          {format(dateRef, "MMMM yyyy")}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setDateRef((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))
          }
        >
          Next
        </Button>
        {!readOnly ? (
          <span className="text-xs text-muted-foreground">
            Drag or scroll to tilt the wall
          </span>
        ) : null}
      </div>

      {readOnly ? (
        <FlatMonthCalendar
          days={days}
          columns={columns}
          events={events}
          readOnly={readOnly}
          onRemoveEvent={onRemoveEvent}
          demoAnimation={demoAnimation}
          demoTargetDay={demoTargetDay}
          demoEvent={demoEvent}
        />
      ) : (
        <div
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="gate-scrollbar-none w-full cursor-grab overflow-hidden rounded-xl border border-border/60 bg-background/40 p-3 active:cursor-grabbing"
          style={{ perspective: 1200 }}
        >
          <div
            className="mx-auto"
            style={{
              width: columns * (panelWidth + gap),
              transformStyle: "preserve-3d",
              transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transition: "transform 120ms linear",
            }}
          >
            <div
              className="relative"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, ${panelWidth}px)`,
                gridAutoRows: `${panelHeight}px`,
                gap: `${gap}px`,
                transformStyle: "preserve-3d",
                padding: gap,
              }}
            >
              {days.map((day, index) => {
                const row = Math.floor(index / columns);
                const rowOffset = row - wallCenterRow;
                const z = Math.max(-80, 40 - Math.abs(rowOffset) * 20);
                const dayEvents = eventsForDay(day);
                const net = dayNetPnl(dayEvents);

                return (
                  <div
                    key={day.toISOString()}
                    className="relative"
                    style={{
                      transform: `translateZ(${z}px)`,
                      zIndex: Math.round(100 - Math.abs(rowOffset)),
                    }}
                  >
                    <DayCell
                      day={day}
                      dayEvents={dayEvents}
                      net={net}
                      readOnly={readOnly}
                      onRemoveEvent={onRemoveEvent}
                      panelWidth={panelWidth}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Session note or symbol"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs"
          />
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-auto"
          />
          <Button type="button" onClick={handleAdd}>
            Add entry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
