"use client";

import { useRef } from "react";

import { ClippedAreaChart } from "@/components/ui/advanced-stats-utils/charts";
import { TimelineAnimation } from "@/components/ui/advanced-stats-utils/timeline-animation";
import { cn } from "@/lib/utils";
import type {
  EquityCurvePoint,
  TradingMetrics,
} from "@/lib/utils/tradingCalculations";

type TradingAdvancedStatsProps = {
  equityCurve: EquityCurvePoint[];
  metrics: TradingMetrics;
};

function usd(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

type KpiStatus = "up" | "down";

function buildKpis(metrics: TradingMetrics) {
  return [
    {
      label: "Total PnL",
      value: usd(metrics.totalPnL),
      change: metrics.totalPnL >= 0 ? "positive" : "negative",
      status: (metrics.totalPnL >= 0 ? "up" : "down") as KpiStatus,
    },
    {
      label: "Win Rate",
      value: pct(metrics.winRate),
      change: `${metrics.winningTrades}W / ${metrics.losingTrades}L`,
      status: (metrics.winRate >= 50 ? "up" : "down") as KpiStatus,
    },
    {
      label: "Profit Factor",
      value: metrics.profitFactor.toFixed(2),
      change: metrics.profitFactor >= 1 ? "above 1" : "below 1",
      status: (metrics.profitFactor >= 1 ? "up" : "down") as KpiStatus,
    },
    {
      label: "Expectancy",
      value: usd(metrics.expectancy),
      change: "per trade",
      status: (metrics.expectancy >= 0 ? "up" : "down") as KpiStatus,
    },
    {
      label: "Max Drawdown",
      value: usd(metrics.maxDrawdown),
      change: "peak to trough",
      status: (metrics.maxDrawdown <= 0 ? "up" : "down") as KpiStatus,
    },
    {
      label: "Avg Win / Loss",
      value: `${usd(metrics.averageWin)}`,
      change: `loss ${usd(metrics.averageLoss)}`,
      status: (metrics.averageWin >= metrics.averageLoss ? "up" : "down") as KpiStatus,
    },
    {
      label: "Total Trades",
      value: String(metrics.totalTrades),
      change: "logged fills",
      status: "up" as KpiStatus,
    },
    {
      label: "Streaks",
      value: `${metrics.consecutiveWins}W`,
      change: `${metrics.consecutiveLosses}L best`,
      status: (metrics.consecutiveWins >= metrics.consecutiveLosses
        ? "up"
        : "down") as KpiStatus,
    },
  ];
}

export function TradingAdvancedStats({
  equityCurve,
  metrics,
}: TradingAdvancedStatsProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const kpis = buildKpis(metrics);

  return (
    <section ref={timelineRef} className="flex flex-col gap-6">
      <TimelineAnimation
        animationNum={1}
        timelineRef={timelineRef}
        className="rounded-3xl border border-border/80 bg-muted/30 p-6 lg:p-8"
      >
        <ClippedAreaChart data={equityCurve} />
      </TimelineAnimation>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi, index) => (
          <TimelineAnimation
            animationNum={2 + index}
            key={kpi.label}
            timelineRef={timelineRef}
            className={cn(
              "rounded-2xl border border-border/80 bg-card p-5 transition-colors",
              kpi.status === "up"
                ? "hover:border-emerald-400/60 hover:bg-emerald-500/5"
                : "hover:border-rose-400/60 hover:bg-rose-500/5",
            )}
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {kpi.label}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xl font-black tracking-tighter text-foreground tabular-nums md:text-2xl">
                {kpi.value}
              </p>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  kpi.status === "up"
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-rose-500/10 text-rose-700",
                )}
              >
                {kpi.change}
              </span>
            </div>
          </TimelineAnimation>
        ))}
      </div>
    </section>
  );
}
