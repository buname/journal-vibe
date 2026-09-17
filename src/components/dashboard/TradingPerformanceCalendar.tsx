"use client";

import { useMemo, useState } from "react";

import { MiniTradingCalendar } from "@/components/dashboard/MiniTradingCalendar";
import type { CalendarData } from "@/components/ui/fullscreen-calendar";
import { MonthlyPnlSummary } from "@/components/ui/monthly-pnl-summary";
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
        <CardTitle className="text-base">Performance calendar</CardTitle>
        <CardDescription className="text-xs">
          Daily PnL — tap a day for the total.
        </CardDescription>
      </CardHeader>
      <MonthlyPnlSummary sessions={sessions} month={calendarMonth} />
      <MiniTradingCalendar
        data={data}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
      />
    </Card>
  );
}
