"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

import { cn } from "@/lib/utils";

type TradePathChartProps = {
  accent?: "win" | "loss" | "neutral";
  className?: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
};

const strokeColors = {
  win: "#34d399",
  loss: "#fb7185",
  neutral: "#94a3b8",
} as const;

export function TradePathChart({
  accent = "neutral",
  className,
  direction,
  entryPrice,
  exitPrice,
}: TradePathChartProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");

  const data = useMemo(() => {
    const entry = Number.isFinite(entryPrice) ? entryPrice : 0;
    const exit = Number.isFinite(exitPrice) ? exitPrice : entry;
    const span = Math.abs(exit - entry);
    const bump = span > 0 ? span * 0.22 : entry * 0.0008 || 1;
    const mid =
      direction === "LONG"
        ? Math.max(entry, exit) - bump * 0.35
        : Math.min(entry, exit) + bump * 0.35;

    return [
      { idx: 0, price: entry, label: "Entry" },
      { idx: 1, price: mid, label: "" },
      { idx: 2, price: exit, label: "Exit" },
    ];
  }, [direction, entryPrice, exitPrice]);

  const stroke = strokeColors[accent];
  const flat = entryPrice === exitPrice;

  return (
    <motion.div
      className={cn("relative h-full w-full", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 6, left: 6, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={flat ? 2 : 2.75}
            strokeDasharray={flat ? "6 4" : undefined}
            fill={`url(#${gradientId})`}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
            animationEasing="ease-out"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-x-3 bottom-1 flex justify-between text-[10px] font-medium uppercase tracking-wide text-white/45">
        <span>Entry</span>
        <span>Exit</span>
      </div>
    </motion.div>
  );
}
