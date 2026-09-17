export type Instrument = {
  symbol: string;
  label: string;
  /**
   * Dollar PnL per 1.0 price unit, per 1.0 of size.
   * Futures: size = contracts. Forex/CFD (FundingPips): size = lots.
   * PnL = (exit − entry) × pointValue × size − fees
   */
  pointValue: number;
};

/**
 * FundingPips FX/CFD instruments.
 *
 * Standard MT5 contract sizes (size = lots):
 * - EURUSD / GBPUSD: 100_000 → $10 per pip (0.0001) per 1.0 lot
 * - XAUUSD: 100 → $1 gold move ≈ $100 per 1.0 lot
 * - NDX100 (US100): 1 → $1 index point per 1.0 lot
 */
export const INSTRUMENTS: Instrument[] = [
  { symbol: "XAUUSD", label: "XAUUSD · Gold (FundingPips)", pointValue: 100 },
  { symbol: "GBPUSD", label: "GBPUSD · Cable (FundingPips)", pointValue: 100_000 },
  { symbol: "EURUSD", label: "EURUSD · Euro (FundingPips)", pointValue: 100_000 },
  { symbol: "NDX100", label: "NDX100 · Nasdaq CFD (FundingPips)", pointValue: 1 },
];

export const OTHER_INSTRUMENT = "OTHER";

export function findInstrument(symbol?: string | null): Instrument | undefined {
  if (!symbol) return undefined;
  return INSTRUMENTS.find((instrument) => instrument.symbol === symbol);
}

/**
 * Resolves the per-point value for a trade: known instruments use their table
 * value; otherwise fall back to an explicit override or 1 (price = dollars).
 */
export function resolvePointValue(
  instrumentType?: string | null,
  override?: number | null,
): number {
  const known = findInstrument(instrumentType);
  if (known) return known.pointValue;
  if (typeof override === "number" && override > 0) return override;
  return 1;
}
