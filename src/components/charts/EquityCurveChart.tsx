"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EquityCurvePoint } from "@/lib/utils/tradingCalculations";

type EquityCurveChartProps = {
  data: EquityCurvePoint[];
};

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Log trades to see the equity curve.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
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
              "Cumulative PnL",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulativePnL"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
