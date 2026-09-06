"use client";

import { format, isSameMonth } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Session = {
  date: string;
  pnl?: number;
  r?: number;
};

function formatPnl(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function MonthlyPnlSummary({
  sessions,
  month,
}: {
  sessions: Session[];
  month: Date;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [showPnl, setShowPnl] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const monthSessions = sessions.filter((session) =>
      isSameMonth(new Date(session.date), month),
    );
    const totalPnl = monthSessions.reduce((sum, session) => sum + (session.pnl ?? 0), 0);
    const totalR = monthSessions.reduce((sum, session) => sum + (session.r ?? 0), 0);
    const wins = monthSessions.filter((session) => (session.pnl ?? 0) > 0).length;
    const losses = monthSessions.filter((session) => (session.pnl ?? 0) < 0).length;
    const tradingDays = new Set(
      monthSessions.map((session) => format(new Date(session.date), "yyyy-MM-dd")),
    ).size;

    const dailyMap = new Map<string, number>();
    for (const session of monthSessions) {
      const key = format(new Date(session.date), "yyyy-MM-dd");
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + (session.pnl ?? 0));
    }

    const dailyBars = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, pnl]) => pnl);
    const maxBar = Math.max(...dailyBars.map(Math.abs), 1);

    return {
      totalPnl,
      totalR,
      wins,
      losses,
      tradingDays,
      dailyBars,
      maxBar,
      fillCount: monthSessions.length,
    };
  }, [sessions, month]);

  const body = (
    <div className="space-y-4 border-b border-border/50 bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent px-4 py-5 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Monthly PnL
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              onClick={() => setShowPnl((value) => !value)}
              aria-label={showPnl ? "Hide monthly PnL" : "Show monthly PnL"}
              aria-pressed={showPnl}
            >
              {showPnl ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <p
            className={cn(
              "font-mono text-3xl font-semibold tracking-tight tabular-nums md:text-4xl",
              !showPnl && "text-muted-foreground",
              showPnl && stats.totalPnl >= 0 && "text-emerald-600",
              showPnl && stats.totalPnl < 0 && "text-rose-600",
            )}
          >
            {showPnl ? formatPnl(stats.totalPnl) : "***"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(month, "MMMM yyyy")} · {stats.fillCount} fills · {stats.tradingDays} days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Total R",
            value: showPnl
              ? `${stats.totalR > 0 ? "+" : ""}${stats.totalR.toFixed(1)}R`
              : "***",
            tone: stats.totalR >= 0 ? "text-emerald-600" : "text-rose-600",
          },
          { label: "Wins", value: String(stats.wins), tone: "text-emerald-600" },
          { label: "Losses", value: String(stats.losses), tone: "text-rose-600" },
          { label: "Fill count", value: String(stats.fillCount), tone: undefined },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-background/80 px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className={cn("mt-1 font-mono text-lg font-semibold tabular-nums", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {showPnl && stats.dailyBars.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-background/70 p-4">
          <div className="flex h-16 items-end gap-1">
            {stats.dailyBars.map((pnl, index) => (
              <motion.div
                key={`${format(month, "yyyy-MM")}-${index}`}
                className="flex flex-1 flex-col justify-end"
                title={formatPnl(pnl)}
                initial={mounted && !reduce ? { scaleY: 0 } : false}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: "bottom" }}
              >
                <div
                  className={cn(
                    "w-full rounded-sm",
                    pnl >= 0 ? "bg-emerald-500/75" : "bg-rose-500/65",
                  )}
                  style={{
                    height: `${Math.max(14, (Math.abs(pnl) / stats.maxBar) * 100)}%`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (!mounted || reduce) return body;

  return (
    <motion.div
      key={format(month, "yyyy-MM")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {body}
    </motion.div>
  );
}
