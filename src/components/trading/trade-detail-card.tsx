"use client";

import { DailySummaryCard } from "@/components/trading/daily-summary-card";

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
  exitTime: string | null;
};

export function tradesOnSameDay(trades: TradeDetailData[], iso: string) {
  const key = iso.slice(0, 10);
  return trades.filter((trade) => trade.date.slice(0, 10) === key);
}

export function TradeDetailCard({
  trade,
  dayTrades,
  userName,
}: {
  trade: TradeDetailData;
  dayTrades?: TradeDetailData[];
  userName?: string | null;
}) {
  const day = dayTrades?.length ? dayTrades : [trade];
  return <DailySummaryCard trades={day} userName={userName} />;
}
