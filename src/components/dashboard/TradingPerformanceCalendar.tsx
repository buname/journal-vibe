"use client";

import { useMemo, useState } from "react";

import type { CalendarData } from "@/components/ui/fullscreen-calendar";
import { MonthlyPnlSummary } from "@/components/ui/monthly-pnl-summary";
import { PnlCalendar } from "@/components/ui/pnl-calendar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TradingPerformanceCalendarProps = {
  data: CalendarData[];
};

export function TradingPerformanceCalendar({
  data,
}: TradingPerformanceCalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const sessions = useMemo(
    () =>
      data.flatMap((entry) =>
        entry.events.map((event) => ({
          date: event.datetime,
          pnl: event.pnl,
          r: event.r,
        })),
      ),
    [data],
  );

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
        <CardTitle className="text-base sm:text-lg">Performance calendar</CardTitle>
        <CardDescription className="text-xs">
          Topstep-style daily PnL heat map — tap a day for fills.
        </CardDescription>
      </CardHeader>
      <MonthlyPnlSummary sessions={sessions} month={calendarMonth} />
      <PnlCalendar
        data={data}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
      />
    </Card>
  );
}
