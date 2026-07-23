"use client";

import dynamic from "next/dynamic";

import type {
  EquityCurvePoint,
  RDistributionRow,
  SessionPerformanceRow,
  CalendarDayData,
} from "@/lib/utils/tradingCalculations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EquityCurveChart = dynamic(
  () =>
    import("@/components/charts/EquityCurveChart").then(
      (m) => m.EquityCurveChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-lg" /> },
);

const RMultipleChart = dynamic(
  () =>
    import("@/components/charts/RMultipleChart").then((m) => m.RMultipleChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

const SessionRadarChart = dynamic(
  () =>
    import("@/components/charts/SessionRadarChart").then(
      (m) => m.SessionRadarChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[26rem] w-full rounded-lg" />,
  },
);

const PerformanceCalendar = dynamic(
  () =>
    import("@/components/charts/PerformanceCalendar").then(
      (m) => m.PerformanceCalendar,
    ),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-lg" /> },
);

type DashboardChartsProps = {
  equityCurve: EquityCurvePoint[];
  rDistribution: RDistributionRow[];
  sessionPerformance: SessionPerformanceRow[];
  calendarData: Record<string, CalendarDayData>;
};

export function DashboardCharts({
  equityCurve,
  rDistribution,
  sessionPerformance,
  calendarData,
}: DashboardChartsProps) {
  return (
    <>
      {/* Row 1: equity + session radar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equity curve</CardTitle>
            <CardDescription>
              Cumulative PnL over time. Gradient area shows trajectory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EquityCurveChart data={equityCurve} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Session radar</CardTitle>
            <CardDescription>
              Trade count, win rate &amp; PnL by market session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionRadarChart data={sessionPerformance} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: day-of-week + calendar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>R-multiple distribution</CardTitle>
            <CardDescription>
              How many trades landed at each R. Green = winners, red = losers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RMultipleChart data={rDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance calendar</CardTitle>
            <CardDescription>
              Heat-map view. Each cell shows PnL &amp; trade count. Toggle
              month / year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceCalendar data={calendarData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
