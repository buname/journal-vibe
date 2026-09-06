"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  calculateDailyPerformance,
  calculateRDistribution,
  calculateSessionPerformance,
  calculateTradingMetrics,
  detectSession,
  generateCalendarData,
  generateEquityCurve,
  tradesToFullScreenCalendarData,
  type DailyPerformanceRow,
  type EquityCurvePoint,
  type RDistributionRow,
  type SessionPerformanceRow,
  type TradingMetrics,
  type CalendarDayData,
} from "@/lib/utils/tradingCalculations";

import type { CalendarData } from "@/components/ui/fullscreen-calendar";

export type DashboardData = {
  metrics: TradingMetrics;
  sessionPerformance: SessionPerformanceRow[];
  dailyPerformance: DailyPerformanceRow[];
  rDistribution: RDistributionRow[];
  calendarData: Record<string, CalendarDayData>;
  calendarEvents: CalendarData[];
  equityCurve: EquityCurvePoint[];
  journalCount: number;
  backtestCount: number;
  dbOffline?: boolean;
};

function emptyDashboardData(): DashboardData {
  const metrics = calculateTradingMetrics([]);
  return {
    metrics,
    sessionPerformance: [],
    dailyPerformance: [],
    rDistribution: [],
    calendarData: {},
    calendarEvents: [],
    equityCurve: [],
    journalCount: 0,
    backtestCount: 0,
    dbOffline: true,
  };
}

export async function getDashboardData(
  startDate?: string,
  endDate?: string,
): Promise<DashboardData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const where =
    Object.keys(dateFilter).length > 0
      ? { userId, date: dateFilter }
      : { userId };

  try {
    const [trades, journalCount, backtestCount] = await Promise.all([
      prisma.tradeLog.findMany({
        where,
        orderBy: { date: "asc" },
        select: {
          id: true,
          symbol: true,
          pnl: true,
          date: true,
          session: true,
          rValue: true,
        },
      }),
      prisma.dailyJournal.count({ where: { userId } }),
      prisma.backtestNote.count({ where: { userId } }),
    ]);

    const metrics = calculateTradingMetrics(trades);
    const sessionPerformance = calculateSessionPerformance(trades);
    const dailyPerformance = calculateDailyPerformance(trades);
    const rDistribution = calculateRDistribution(trades);
    const calendarData = generateCalendarData(trades);
    const calendarEvents = tradesToFullScreenCalendarData(trades);
    const equityCurve = generateEquityCurve(trades);

    return {
      metrics,
      sessionPerformance,
      dailyPerformance,
      rDistribution,
      calendarData,
      calendarEvents,
      equityCurve,
      journalCount,
      backtestCount,
    };
  } catch {
    return emptyDashboardData();
  }
}

export async function bulkDetectSessions(): Promise<{
  updated: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { updated: 0, error: "You must be signed in." };
  }

  const trades = await prisma.tradeLog.findMany({
    where: { userId: session.user.id },
    select: { id: true, entryTime: true, session: true },
  });

  let updated = 0;

  for (const trade of trades) {
    if (trade.entryTime && !trade.session) {
      const detected = detectSession(trade.entryTime);
      await prisma.tradeLog.update({
        where: { id: trade.id },
        data: { session: detected },
      });
      updated++;
    }
  }

  if (updated > 0) {
    revalidatePath("/dashboard");
    revalidatePath("/trades");
  }

  return { updated };
}
