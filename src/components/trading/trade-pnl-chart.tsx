"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TradePnlPoint = {
  label: string;
  pnl: number;
};

type TradePnlChartProps = {
  data: TradePnlPoint[];
};

export function TradePnlChart({ data }: TradePnlChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Log a few trades to populate this chart.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
            formatter={(value) => [
              typeof value === "number" ? value.toFixed(2) : String(value),
              "PnL",
            ]}
            labelFormatter={(label) => `Trade · ${label}`}
            contentStyle={{
              borderRadius: 8,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
          />
          <Bar
            dataKey="pnl"
            radius={[6, 6, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
