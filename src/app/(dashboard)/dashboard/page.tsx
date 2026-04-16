import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { getDashboardData } from "@/lib/actions/dashboard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

function usd(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function pct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function trend(n: number): "positive" | "negative" | "neutral" {
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "neutral";
}

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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Trading overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time metrics, charts, and calendar heat-map.
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

      {/* Metric cards: 4 columns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total PnL"
          value={usd(m.totalPnL)}
          subtitle={`${m.totalTrades} total trades`}
          trend={trend(m.totalPnL)}
        />
        <MetricCard
          title="Win Rate"
          value={pct(m.winRate)}
          subtitle={`${m.winningTrades}W / ${m.losingTrades}L`}
          trend={m.winRate >= 50 ? "positive" : m.winRate > 0 ? "negative" : "neutral"}
        />
        <MetricCard
          title="Profit Factor"
          value={m.profitFactor.toFixed(2)}
          subtitle={`Gross profit ${usd(m.grossProfit)}`}
          trend={m.profitFactor >= 1 ? "positive" : "negative"}
        />
        <MetricCard
          title="Expectancy"
          value={usd(m.expectancy)}
          subtitle="Expected value per trade"
          trend={trend(m.expectancy)}
        />
        <MetricCard
          title="Total Trades"
          value={String(m.totalTrades)}
          subtitle={`Journal: ${data.journalCount} · Backtests: ${data.backtestCount}`}
          trend="neutral"
        />
        <MetricCard
          title="Max Drawdown"
          value={usd(m.maxDrawdown)}
          subtitle="Largest peak-to-trough decline"
          trend={m.maxDrawdown > 0 ? "negative" : "neutral"}
        />
        <MetricCard
          title="Avg Win / Loss"
          value={`${usd(m.averageWin)} / ${usd(m.averageLoss)}`}
          subtitle={`Largest: ${usd(m.largestWin)} / ${usd(m.largestLoss)}`}
          trend={m.averageWin > m.averageLoss ? "positive" : "negative"}
        />
        <MetricCard
          title="Streaks"
          value={`${m.consecutiveWins}W / ${m.consecutiveLosses}L`}
          subtitle="Best consecutive wins / losses"
          trend={
            m.consecutiveWins > m.consecutiveLosses ? "positive" : "negative"
          }
        />
      </div>

      {/* Charts */}
      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-lg lg:col-span-2" />
            <Skeleton className="h-72 rounded-lg" />
          </div>
        }
      >
        <DashboardCharts
          equityCurve={data.equityCurve}
          dailyPerformance={data.dailyPerformance}
          sessionPerformance={data.sessionPerformance}
          calendarData={data.calendarData}
        />
      </Suspense>
    </div>
  );
}
