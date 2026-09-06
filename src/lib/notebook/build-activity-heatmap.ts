import type { BacktestNote, DailyJournal, TradeLog } from "@prisma/client";

import type { HeatmapDay } from "@/components/ui/activity-heatmap";
import { toDayKey } from "@/lib/format";

function dayKey(date: Date) {
  return toDayKey(date);
}

export function buildActivityHeatmap(
  journals: DailyJournal[],
  trades: TradeLog[],
  backtests: BacktestNote[],
): HeatmapDay[] {
  const byDay = new Map<
    string,
    { journal: number; trade: number; backtest: number }
  >();

  const bump = (date: Date, kind: "journal" | "trade" | "backtest") => {
    const key = dayKey(date);
    const entry = byDay.get(key) ?? { journal: 0, trade: 0, backtest: 0 };
    entry[kind] += 1;
    byDay.set(key, entry);
  };

  for (const entry of journals) bump(entry.date, "journal");
  for (const entry of trades) bump(entry.date, "trade");
  for (const entry of backtests) bump(entry.date, "backtest");

  return Array.from(byDay.entries())
    .map(([date, counts]) => ({
      date,
      count: counts.journal + counts.trade + counts.backtest,
      journal: counts.journal,
      trade: counts.trade,
      backtest: counts.backtest,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeActivityHeatmap(data: HeatmapDay[]) {
  const total = data.reduce((sum, day) => sum + day.count, 0);
  const activeDays = data.filter((day) => day.count > 0).length;
  const journals = data.reduce((sum, day) => sum + (day.journal ?? 0), 0);
  const trades = data.reduce((sum, day) => sum + (day.trade ?? 0), 0);
  const backtests = data.reduce((sum, day) => sum + (day.backtest ?? 0), 0);

  return { total, activeDays, journals, trades, backtests };
}
