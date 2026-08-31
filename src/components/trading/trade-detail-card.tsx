"use client";

import { format } from "date-fns";

import { PnlBadge } from "@/components/trading/pnl-badge";
import { cn } from "@/lib/utils";

export type TradeDetailData = {
  id: string;
  symbol: string;
  direction: string;
  pnl: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
  rValue: number | null;
  fees: number;
  session: string | null;
  notes: string | null;
  images: string[];
  date: string;
  entryTime: string | null;
};

function dayKey(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd");
}

export function tradesOnSameDay(trades: TradeDetailData[], iso: string) {
  const key = dayKey(iso);
  return trades.filter((trade) => dayKey(trade.date) === key);
}

export function TradeDetailCard({
  trade,
  dayTrades,
}: {
  trade: TradeDetailData;
  dayTrades?: TradeDetailData[];
}) {
  const day = dayTrades?.length ? dayTrades : [trade];
  const net = day.reduce((sum, item) => sum + item.pnl, 0);
  const wins = day.filter((item) => item.pnl > 0).length;
  const losses = day.filter((item) => item.pnl < 0).length;
  const decided = wins + losses;
  const winRate = decided ? Math.round((wins / decided) * 100) : 0;
  const best = [...day].sort((a, b) => b.pnl - a.pnl)[0] ?? trade;
  const when = new Date(trade.date);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="space-y-1 border-b border-border/70 px-5 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {format(when, "EEEE")}
        </p>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {format(when, "MMM d, yyyy")}
          </h2>
          <PnlBadge pnl={net} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70">
        <Stat label="Trades" value={String(day.length)} />
        <Stat
          label="Win rate"
          value={`${winRate}%`}
          tone={winRate >= 50 ? "up" : decided ? "down" : undefined}
        />
        <Stat
          label="W / L"
          value={`${wins} / ${losses}`}
          tone={wins > losses ? "up" : losses > wins ? "down" : undefined}
        />
      </div>

      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Best trade
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {best.direction} {best.symbol}
          </p>
          <PnlBadge pnl={best.pnl} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-lg font-semibold tabular-nums tracking-tight",
          tone === "up" && "text-emerald-700 dark:text-emerald-400",
          tone === "down" && "text-red-700 dark:text-red-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}
