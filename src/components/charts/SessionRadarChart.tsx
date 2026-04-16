"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { SessionPerformanceRow } from "@/lib/utils/tradingCalculations";

type SessionRadarChartProps = {
  data: SessionPerformanceRow[];
};

export function SessionRadarChart({ data }: SessionRadarChartProps) {
  const hasTrades = data.some((d) => d.trades > 0);

  if (!hasTrades) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No session data yet.
      </p>
    );
  }

  const maxPnl = Math.max(...data.map((d) => Math.abs(d.pnl)), 1);
  const chartData = data.map((d) => ({
    session: d.session,
    trades: d.trades,
    winRate: d.winRate,
    pnlMagnitude: Math.round((Math.abs(d.pnl) / maxPnl) * 100),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid className="stroke-border" />
          <PolarAngleAxis
            dataKey="session"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
          />
          <Radar
            name="Trades"
            dataKey="trades"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.15}
          />
          <Radar
            name="Win Rate"
            dataKey="winRate"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
          />
          <Radar
            name="PnL Magnitude"
            dataKey="pnlMagnitude"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
