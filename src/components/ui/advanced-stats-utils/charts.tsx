"use client";

import { useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { EquityCurvePoint } from "@/lib/utils/tradingCalculations";

type ClippedAreaChartProps = {
  className?: string;
  data: EquityCurvePoint[];
};

function usd(value: number, precise = false): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: precise ? 2 : 0,
  }).format(value);
}

function formatAxisDate(value: string) {
  if (value.length >= 10) return value.slice(5);
  return value;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      pnl: number;
    };
  }>;
};

function EquityTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]!.payload;

  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{point.date}</p>
      <p className="text-sm font-bold tabular-nums">{usd(point.pnl, true)}</p>
    </div>
  );
}

export function ClippedAreaChart({ className, data }: ClippedAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        date: point.date,
        pnl: point.cumulativePnL,
      })),
    [data],
  );

  const lastValue = chartData.at(-1)?.pnl ?? 0;
  const firstValue = chartData[0]?.pnl ?? 0;
  const delta = lastValue - firstValue;
  const displayValue =
    hoverIndex != null ? (chartData[hoverIndex]?.pnl ?? lastValue) : lastValue;
  const isUp = delta >= 0;

  const chartConfig = {
    pnl: {
      label: "Cumulative PnL",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div
        className={cn(
          "flex h-72 items-center justify-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log trades to see your equity curve.
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current balance
          </p>
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {usd(displayValue, true)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 px-2 py-0.5 font-semibold",
                isUp
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-rose-500/10 text-rose-700",
              )}
            >
              {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {isUp ? "+" : ""}
              {usd(delta, true)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Cumulative PnL over the period
            </span>
          </div>
        </div>
      </div>

      <div ref={chartRef} className="relative h-[22rem] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border/50"
        >
          <ComposedChart
            data={chartData}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex != null) {
                setHoverIndex(Number(state.activeTooltipIndex));
              }
            }}
            onMouseLeave={() => setHoverIndex(null)}
            margin={{ top: 12, right: 8, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="equityLineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <pattern id="equityDotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="hsl(var(--border))" fillOpacity="0.45" />
              </pattern>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="url(#equityDotGrid)" style={{ pointerEvents: "none" }} />

            <CartesianGrid
              strokeDasharray="4 8"
              stroke="hsl(var(--border))"
              horizontal
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tickFormatter={formatAxisDate}
              interval="preserveStartEnd"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              width={72}
              tickFormatter={(value: number) => usd(value)}
            />

            <ChartTooltip
              content={<EquityTooltip />}
              cursor={{ strokeDasharray: "4 4", stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.45 }}
            />

            <Line
              type="monotone"
              dataKey="pnl"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
}
