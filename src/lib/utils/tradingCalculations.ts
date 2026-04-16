import { format, getDay } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TradeLike = {
  pnl: number;
  date: Date;
  session: string | null;
};

export type TradingMetrics = {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
};

export type SessionPerformanceRow = {
  session: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  winRate: number;
};

export type DailyPerformanceRow = {
  day: string;
  dayIndex: number;
  pnl: number;
  trades: number;
};

export type CalendarDayData = {
  pnl: number;
  trades: number;
};

export type EquityCurvePoint = {
  date: string;
  cumulativePnL: number;
};

// ---------------------------------------------------------------------------
// Session detection
// ---------------------------------------------------------------------------

const SESSION_NAMES = [
  "London",
  "New York",
  "Asia",
  "Out Of Session",
] as const;

export type SessionName = (typeof SESSION_NAMES)[number];

export function detectSession(date: Date): SessionName {
  const utcHour = date.getUTCHours();
  if (utcHour >= 0 && utcHour < 7) return "Asia";
  if (utcHour >= 7 && utcHour < 12) return "London";
  if (utcHour >= 12 && utcHour < 21) return "New York";
  return "Out Of Session";
}

// ---------------------------------------------------------------------------
// Core metrics
// ---------------------------------------------------------------------------

export function calculateTradingMetrics(trades: TradeLike[]): TradingMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      expectancy: 0,
      largestWin: 0,
      largestLoss: 0,
      maxDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
  }

  let grossProfit = 0;
  let grossLoss = 0;
  let largestWin = 0;
  let largestLoss = 0;

  const wins: number[] = [];
  const losses: number[] = [];

  for (const t of trades) {
    if (t.pnl > 0) {
      wins.push(t.pnl);
      grossProfit += t.pnl;
      if (t.pnl > largestWin) largestWin = t.pnl;
    } else if (t.pnl < 0) {
      losses.push(t.pnl);
      grossLoss += t.pnl;
      if (t.pnl < largestLoss) largestLoss = t.pnl;
    }
  }

  const totalPnL = grossProfit + grossLoss;
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss !== 0 ? grossProfit / Math.abs(grossLoss) : 0;
  const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss =
    losses.length > 0 ? Math.abs(grossLoss) / losses.length : 0;
  const expectancy = trades.length > 0 ? totalPnL / trades.length : 0;

  // Max drawdown from equity curve
  const sorted = [...trades].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  let peak = 0;
  let cumulative = 0;
  let maxDrawdown = 0;
  for (const t of sorted) {
    cumulative += t.pnl;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Consecutive wins / losses
  let cw = 0;
  let cl = 0;
  let bestCw = 0;
  let bestCl = 0;
  for (const t of sorted) {
    if (t.pnl > 0) {
      cw++;
      cl = 0;
    } else if (t.pnl < 0) {
      cl++;
      cw = 0;
    } else {
      cw = 0;
      cl = 0;
    }
    if (cw > bestCw) bestCw = cw;
    if (cl > bestCl) bestCl = cl;
  }

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: Math.round(winRate * 100) / 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossLoss: Math.round(grossLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    expectancy: Math.round(expectancy * 100) / 100,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    consecutiveWins: bestCw,
    consecutiveLosses: bestCl,
  };
}

// ---------------------------------------------------------------------------
// Session performance
// ---------------------------------------------------------------------------

export function calculateSessionPerformance(
  trades: TradeLike[],
): SessionPerformanceRow[] {
  const map = new Map<
    string,
    { trades: number; wins: number; losses: number; pnl: number }
  >();

  for (const name of SESSION_NAMES) {
    map.set(name, { trades: 0, wins: 0, losses: 0, pnl: 0 });
  }

  for (const t of trades) {
    const key = t.session ?? "Out Of Session";
    const row = map.get(key) ?? { trades: 0, wins: 0, losses: 0, pnl: 0 };
    row.trades++;
    row.pnl += t.pnl;
    if (t.pnl > 0) row.wins++;
    else if (t.pnl < 0) row.losses++;
    map.set(key, row);
  }

  return SESSION_NAMES.map((name) => {
    const row = map.get(name)!;
    return {
      session: name,
      ...row,
      pnl: Math.round(row.pnl * 100) / 100,
      winRate: row.trades > 0 ? Math.round((row.wins / row.trades) * 10000) / 100 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Daily (day-of-week) performance
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function calculateDailyPerformance(
  trades: TradeLike[],
): DailyPerformanceRow[] {
  const buckets = DAY_NAMES.map((day, i) => ({
    day,
    dayIndex: i,
    pnl: 0,
    trades: 0,
  }));

  for (const t of trades) {
    const idx = getDay(t.date);
    buckets[idx].pnl += t.pnl;
    buckets[idx].trades++;
  }

  return buckets.map((b) => ({
    ...b,
    pnl: Math.round(b.pnl * 100) / 100,
  }));
}

// ---------------------------------------------------------------------------
// Calendar heat-map data
// ---------------------------------------------------------------------------

export function generateCalendarData(
  trades: TradeLike[],
): Record<string, CalendarDayData> {
  const out: Record<string, CalendarDayData> = {};

  for (const t of trades) {
    const key = format(t.date, "yyyy-MM-dd");
    const existing = out[key] ?? { pnl: 0, trades: 0 };
    existing.pnl += t.pnl;
    existing.trades++;
    out[key] = existing;
  }

  for (const key of Object.keys(out)) {
    out[key].pnl = Math.round(out[key].pnl * 100) / 100;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Equity curve
// ---------------------------------------------------------------------------

export function generateEquityCurve(trades: TradeLike[]): EquityCurvePoint[] {
  const sorted = [...trades].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += t.pnl;
    return {
      date: format(t.date, "yyyy-MM-dd"),
      cumulativePnL: Math.round(cumulative * 100) / 100,
    };
  });
}
