import type { BacktestNote, DailyJournal, TradeLog } from "@prisma/client";

import { excerptFromContent } from "@/lib/journal/excerpt";
import type { NotebookTimelineItem } from "@/types/notebook";

export function buildNotebookTimeline(
  journals: DailyJournal[],
  trades: TradeLog[],
  backtests: BacktestNote[],
): NotebookTimelineItem[] {
  const journalItems: NotebookTimelineItem[] = journals.map((entry) => ({
    kind: "journal",
    id: entry.id,
    date: entry.date,
    title: entry.title,
    rating: entry.rating,
    tags: entry.tags,
    excerpt: excerptFromContent(entry.content),
  }));

  const tradeItems: NotebookTimelineItem[] = trades.map((trade) => ({
    kind: "trade",
    id: trade.id,
    date: trade.date,
    symbol: trade.symbol,
    direction: trade.direction,
    pnl: trade.pnl,
    tags: trade.tags,
  }));

  const backtestItems: NotebookTimelineItem[] = backtests.map((note) => ({
    kind: "backtest",
    id: note.id,
    date: note.date,
    strategy: note.strategy,
    timeframe: note.timeframe,
    winRate: note.winRate,
    expectancy: note.expectancy,
    tags: note.tags,
  }));

  return [...journalItems, ...tradeItems, ...backtestItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}
