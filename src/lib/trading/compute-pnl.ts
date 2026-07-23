import type { TradeUpsertInput } from "@/lib/validations/trade";

export function computeTradePnL(input: {
  direction: TradeUpsertInput["direction"];
  entryPrice: number;
  exitPrice: number;
  size: number;
  fees: number;
  pointValue?: number | null;
}): number {
  const pv =
    typeof input.pointValue === "number" && input.pointValue > 0
      ? input.pointValue
      : 1;
  const gross =
    input.direction === "LONG"
      ? (input.exitPrice - input.entryPrice) * pv * input.size
      : (input.entryPrice - input.exitPrice) * pv * input.size;
  const net = gross - input.fees;
  return Math.round(net * 100) / 100;
}

/** Realized R multiple from entry/stop/exit; null when no valid stop. */
export function computeRValue(input: {
  direction: TradeUpsertInput["direction"];
  entryPrice: number;
  exitPrice: number;
  stopPrice?: number | null;
}): number | null {
  if (typeof input.stopPrice !== "number") return null;
  const risk = Math.abs(input.entryPrice - input.stopPrice);
  if (risk <= 0) return null;
  const move =
    input.direction === "LONG"
      ? input.exitPrice - input.entryPrice
      : input.entryPrice - input.exitPrice;
  return Math.round((move / risk) * 100) / 100;
}
