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

import type { RDistributionRow } from "@/lib/utils/tradingCalculations";

type RMultipleChartProps = {
  data: RDistributionRow[];
};

export function RMultipleChart({ data }: RMultipleChartProps) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Add a stop to your trades to build the R-multiple distribution.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted-foreground))", fillOpacity: 0.12 }}
            contentStyle={{
              borderRadius: 8,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            formatter={(value) => [String(value), "Trades"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.bucket}
                fill={
                  entry.index > 0
                    ? "rgb(16 185 129)"
                    : entry.index < 0
                      ? "rgb(244 63 94)"
                      : "rgb(148 163 184)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
