import { format } from "date-fns";

import type { TradeDetailData } from "@/components/trading/trade-detail-card";

export function formatPnl(value: number, precise = false) {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);
  const formatted = precise
    ? abs.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${sign}$${formatted}`;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function formatTradeDuration(
  entryTime: string | null,
  exitTime: string | null,
): string | null {
  if (!entryTime || !exitTime) return null;
  const start = new Date(entryTime).getTime();
  const end = new Date(exitTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  const totalMinutes = Math.round((end - start) / 60_000);
  if (totalMinutes < 1) return "<1m";
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function shareFileName(trade: TradeDetailData) {
  const day = format(new Date(trade.date), "yyyy-MM-dd");
  return `${trade.symbol}-${trade.direction}-${day}.png`;
}

export function isTradeDraft(trade: TradeDetailData) {
  return trade.entryPrice === 0 && trade.exitPrice === 0 && trade.size === 0;
}

export type TradeAccent = "win" | "loss" | "neutral";

export function tradeAccent(pnl: number): TradeAccent {
  if (pnl > 0) return "win";
  if (pnl < 0) return "loss";
  return "neutral";
}
