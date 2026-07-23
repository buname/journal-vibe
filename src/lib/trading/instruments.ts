export type Instrument = {
  symbol: string;
  label: string;
  /** USD profit/loss per 1.0 price point, per contract. */
  pointValue: number;
};

/** The micro futures we trade, with their per-point dollar values. */
export const INSTRUMENTS: Instrument[] = [
  { symbol: "MNQ", label: "MNQ · Micro Nasdaq-100", pointValue: 2 },
  { symbol: "MES", label: "MES · Micro S&P 500", pointValue: 5 },
  { symbol: "MYM", label: "MYM · Micro Dow", pointValue: 0.5 },
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
