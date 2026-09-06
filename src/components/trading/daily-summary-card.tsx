"use client";

import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { RefObject } from "react";

import type { TradeDetailData } from "@/components/trading/trade-detail-card";
import { formatPnl } from "@/components/trading/trade-card-utils";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

type DailySummaryCardProps = {
  trades: TradeDetailData[];
  userName?: string | null;
  className?: string;
  exportRef?: RefObject<HTMLDivElement | null>;
};

export function DailySummaryCard({
  trades,
  userName,
  className,
  exportRef,
}: DailySummaryCardProps) {
  if (!trades.length) return null;

  const anchor = new Date(trades[0]!.date);
  const net = trades.reduce((sum, item) => sum + item.pnl, 0);
  const wins = trades.filter((item) => item.pnl > 0).length;
  const losses = trades.filter((item) => item.pnl < 0).length;
  const decided = wins + losses;
  const winRate = decided ? Math.round((wins / decided) * 100) : 0;
  const best = [...trades].sort((a, b) => b.pnl - a.pnl)[0]!;
  const symbols = [...new Set(trades.map((item) => item.symbol))];
  const accent = net > 0 ? "win" : net < 0 ? "loss" : "neutral";

  return (
    <div
      ref={exportRef}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_28px_70px_-32px_hsl(var(--foreground)/0.2)]",
        className,
      )}
    >
      <Spotlight
        className="from-primary/30 via-primary/12 to-transparent blur-2xl"
        size={220}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
          accent === "win" && "from-emerald-500/[0.08] via-transparent to-primary/[0.04]",
          accent === "loss" && "from-rose-500/[0.08] via-transparent to-primary/[0.04]",
          accent === "neutral" && "from-primary/[0.06] via-transparent to-transparent",
        )}
      />

      <div className="relative z-[1] p-6 sm:p-8">
        <header>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-[2rem]">
                {format(anchor, "EEEE")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {format(anchor, "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {symbols.map((symbol) => (
                <span
                  key={symbol}
                  className="rounded-full bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground ring-1 ring-border/70"
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>
          <p
            className={cn(
              "mt-4 text-4xl font-bold tabular-nums tracking-tight sm:text-[2.5rem]",
              accent === "win" && "text-emerald-600",
              accent === "loss" && "text-rose-600",
              accent === "neutral" && "text-foreground",
            )}
          >
            {formatPnl(net, true)}
          </p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryStat label="Trades" value={String(trades.length)} />
          <SummaryStat
            label="Win rate"
            value={`${winRate}%`}
            tone={winRate >= 50 ? "win" : decided ? "loss" : undefined}
          />
          <SummaryStat
            label="W / L"
            value={`${wins} / ${losses}`}
            tone={wins > losses ? "win" : losses > wins ? "loss" : undefined}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Best trade
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <DirectionPill direction={best.direction} />
            <p
              className={cn(
                "text-xl font-bold tabular-nums",
                best.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {formatPnl(best.pnl, true)}
            </p>
          </div>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(userName ?? "J").charAt(0).toUpperCase()}
            </span>
            <span className="font-medium text-foreground">{userName ?? "Journal"}</span>
          </div>
          <time className="tabular-nums" dateTime={anchor.toISOString()}>
            {format(anchor, "MMM d, yyyy · h:mm a")}
          </time>
        </footer>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "win" | "loss";
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-4 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tabular-nums tracking-tight",
          tone === "win" && "text-emerald-600",
          tone === "loss" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DirectionPill({ direction }: { direction: string }) {
  const isLong = direction === "LONG";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        isLong ? "bg-emerald-500/12 text-emerald-700" : "bg-rose-500/12 text-rose-700",
      )}
    >
      {isLong ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {direction}
    </span>
  );
}
