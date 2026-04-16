"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyPerformanceRow } from "@/lib/utils/tradingCalculations";

type DailyPerformanceChartProps = {
  data: DailyPerformanceRow[];
};

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  const hasTrades = data.some((d) => d.trades > 0);

  if (!hasTrades) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No trade data for day-of-week breakdown.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
            formatter={(value) => [
              typeof value === "number" ? `$${value.toFixed(2)}` : String(value),
              "PnL",
            ]}
          />
          <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={
                  entry.pnl >= 0
                    ? "rgb(16 185 129)" // emerald-500
                    : "rgb(244 63 94)" // rose-500
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
