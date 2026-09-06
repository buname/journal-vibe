import { isSameWeek, subDays } from "date-fns";

import type { HeatmapDay } from "@/components/ui/activity-heatmap";
import { toDayKey } from "@/lib/format";

type JournalEntry = {
  date: Date;
  rating: number | null;
  images: string[];
};

export type JournalStats = {
  totalEntries: number;
  streak: number;
  avgMood: number | null;
  ratedCount: number;
  thisWeek: number;
  withPhotos: number;
  activeDays: number;
};

export function buildJournalHeatmap(
  entries: { date: Date }[],
): HeatmapDay[] {
  const byDay = new Map<string, number>();

  for (const entry of entries) {
    const key = toDayKey(entry.date);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return Array.from(byDay.entries())
    .map(([date, count]) => ({
      date,
      count,
      journal: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeJournalStats(entries: JournalEntry[]): JournalStats {
  const today = new Date();
  const daySet = new Set(entries.map((entry) => toDayKey(entry.date)));

  let streak = 0;
  let cursor = today;
  if (!daySet.has(toDayKey(cursor))) {
    cursor = subDays(cursor, 1);
  }
  while (daySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  const rated = entries.filter((entry) => entry.rating != null && entry.rating > 0);
  const totalRating = rated.reduce((sum, entry) => sum + (entry.rating ?? 0), 0);

  return {
    totalEntries: entries.length,
    streak,
    avgMood: rated.length > 0 ? totalRating / rated.length : null,
    ratedCount: rated.length,
    thisWeek: entries.filter((entry) =>
      isSameWeek(entry.date, today, { weekStartsOn: 1 }),
    ).length,
    withPhotos: entries.filter((entry) => entry.images.length > 0).length,
    activeDays: daySet.size,
  };
}
