import type { TradeUpsertInput } from "@/lib/validations/trade";

export function computeTradePnL(input: {
  direction: TradeUpsertInput["direction"];
  entryPrice: number;
  exitPrice: number;
  size: number;
  fees: number;
}): number {
  const gross =
    input.direction === "LONG"
      ? (input.exitPrice - input.entryPrice) * input.size
      : (input.entryPrice - input.exitPrice) * input.size;
  const net = gross - input.fees;
  return Math.round(net * 100) / 100;
}
