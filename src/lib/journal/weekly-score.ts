import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from "date-fns";

type RatedEntry = {
  id: string;
  title: string;
  date: Date;
  rating: number | null;
};

export type WeekDayEntry = {
  date: Date;
  dayLabel: string;
  entry: RatedEntry | null;
};

export type WeeklySummary = {
  weekLabel: string;
  weekStart: Date;
  days: WeekDayEntry[];
  ratedCount: number;
  totalRating: number;
  scoreOutOf10: number | null;
};

export function buildWeeklySummaries(entries: RatedEntry[]): WeeklySummary[] {
  if (entries.length === 0) return [];

  const weekMap = new Map<string, RatedEntry[]>();

  for (const entry of entries) {
    const ws = startOfWeek(entry.date, { weekStartsOn: 1 });
    const key = ws.toISOString();
    const bucket = weekMap.get(key) ?? [];
    bucket.push(entry);
    weekMap.set(key, bucket);
  }

  const summaries: WeeklySummary[] = [];

  for (const [, weekEntries] of weekMap) {
    const ws = startOfWeek(weekEntries[0].date, { weekStartsOn: 1 });
    const we = endOfWeek(weekEntries[0].date, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({ start: ws, end: we });

    const days: WeekDayEntry[] = allDays.map((day) => {
      const match = weekEntries.find((e) => isSameDay(e.date, day));
      return {
        date: day,
        dayLabel: format(day, "EEE"),
        entry: match ?? null,
      };
    });

    const rated = weekEntries.filter((e) => e.rating != null && e.rating > 0);
    const totalRating = rated.reduce((sum, e) => sum + (e.rating ?? 0), 0);
    const scoreOutOf10 =
      rated.length > 0
        ? Math.round((totalRating / (rated.length * 5)) * 10 * 10) / 10
        : null;

    summaries.push({
      weekLabel: `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`,
      weekStart: ws,
      days,
      ratedCount: rated.length,
      totalRating,
      scoreOutOf10,
    });
  }

  summaries.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  return summaries;
}
