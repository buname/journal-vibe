import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { TradingAdvancedStats } from "@/components/dashboard/TradingAdvancedStats";
import { TradingPerformanceCalendar } from "@/components/dashboard/TradingPerformanceCalendar";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { DbOfflineBanner } from "@/components/layout/db-offline-banner";
import { getDashboardData } from "@/lib/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const data = await getDashboardData(params.from, params.to);

  if (!data) {
    redirect("/login");
  }

  const { metrics: m } = data;
  const hasDateFilter = Boolean(params.from || params.to);

  return (
    <div className="space-y-8">
      {data.dbOffline ? (
        <DbOfflineBanner message="Database is offline — metrics will populate once PostgreSQL is running." />
      ) : null}
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Trading overview
          </h1>
          <p className="text-sm text-muted-foreground">
            PnL, R, and the session&apos;s work, reviewed after the fact.
            {hasDateFilter ? " Filtered by date range." : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/notebook">Open timeline</Link>
        </Button>
      </div>

      {/* Date range filter */}
      <Suspense fallback={<Skeleton className="h-8 w-80 rounded-md" />}>
        <DateRangeFilter />
      </Suspense>

      {/* Advanced stats from 21st */}
      <TradingAdvancedStats equityCurve={data.equityCurve} metrics={m} />

      <TradingPerformanceCalendar data={data.calendarEvents} />
    </div>
  );
}
