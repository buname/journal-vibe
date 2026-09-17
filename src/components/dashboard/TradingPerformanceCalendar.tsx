"use client";

import { useMemo, useState } from "react";

import {
  FullScreenCalendar,
  type CalendarData,
} from "@/components/ui/fullscreen-calendar";
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
      <CardHeader className="border-b border-border/60 bg-muted/20 py-4">
        <CardTitle className="text-base sm:text-lg">Day by day</CardTitle>
        <CardDescription className="text-xs">
          Trading calendar for fills — green when the day nets positive, red when
          it does not. Journal days and notes live on the same timeline.
        </CardDescription>
      </CardHeader>
      <MonthlyPnlSummary sessions={sessions} month={calendarMonth} />
      <CardContent className="p-0">
        <FullScreenCalendar
          data={data}
          readOnly
          initialMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          className="rounded-none border-0 shadow-none"
        />
      </CardContent>
    </Card>
  );
}
