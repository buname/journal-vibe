"use client";

import { useMemo, useState } from "react";

import type { CalendarData } from "@/components/ui/fullscreen-calendar";
import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar";
import { MonthlyPnlSummary } from "@/components/ui/monthly-pnl-summary";
import {
  Card,
  CardContent,
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
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <CardTitle className="text-xl">Performance calendar</CardTitle>
        <CardDescription>
          Daily PnL heat-map — tap the eye to reveal monthly totals.
        </CardDescription>
      </CardHeader>
      <MonthlyPnlSummary sessions={sessions} month={calendarMonth} />
      <CardContent className="p-0">
        <FullScreenCalendar
          data={data}
          readOnly
          variant="trading"
          onMonthChange={setCalendarMonth}
        />
      </CardContent>
    </Card>
  );
}
