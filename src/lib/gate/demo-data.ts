import { subDays } from "date-fns";

import { toDayKey } from "@/lib/format";

export type DemoPnlSession = {
  id: string;
  title: string;
  symbol: string;
  date: string;
  pnl: number;
  r: number;
};

const tradeTemplates = [
  { title: "MNQ LONG", symbol: "MNQ", day: 2, hour: 14, min: 30, pnl: 340, r: 1.2 },
  { title: "MES SHORT", symbol: "MES", day: 3, hour: 15, min: 0, pnl: -95, r: -0.3 },
  { title: "MYM LONG", symbol: "MYM", day: 5, hour: 13, min: 45, pnl: 180, r: 0.8 },
  { title: "MNQ SHORT", symbol: "MNQ", day: 8, hour: 14, min: 15, pnl: 520, r: 1.8 },
  { title: "MES LONG", symbol: "MES", day: 10, hour: 15, min: 30, pnl: -210, r: -0.7 },
  { title: "MNQ LONG", symbol: "MNQ", day: 12, hour: 14, min: 0, pnl: 275, r: 1.0 },
  { title: "MYM SHORT", symbol: "MYM", day: 15, hour: 13, min: 30, pnl: 130, r: 0.5 },
  { title: "MES SHORT", symbol: "MES", day: 18, hour: 15, min: 45, pnl: -160, r: -0.5 },
  { title: "MNQ LONG", symbol: "MNQ", day: 22, hour: 14, min: 20, pnl: 410, r: 1.5 },
  { title: "MES LONG", symbol: "MES", day: 25, hour: 15, min: 10, pnl: 90, r: 0.3 },
] as const;

const activityOffsets = [
  240, 210, 180, 150, 120, 90, 75, 60, 45, 30, 21, 14, 7, 3, 1, 0,
];

export function startOfCurrentMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function buildDemoPnlSessions(now = new Date()): DemoPnlSession[] {
  const year = now.getFullYear();
  const month = now.getMonth();

  return tradeTemplates.map((trade, index) => ({
    id: `s${index + 1}`,
    title: trade.title,
    symbol: trade.symbol,
    date: new Date(year, month, trade.day, trade.hour, trade.min).toISOString(),
    pnl: trade.pnl,
    r: trade.r,
  }));
}

export function buildDemoContribution(now = new Date()) {
  return activityOffsets.map((daysAgo, index) => ({
    date: toDayKey(subDays(now, daysAgo)),
    count: (index % 5) + 1,
  }));
}
