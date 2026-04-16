import Link from "next/link";
import { Star, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WeeklySummary } from "@/lib/journal/weekly-score";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : score >= 5
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
        : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-lg font-bold tabular-nums",
        color,
      )}
    >
      <Trophy className="size-4" />
      {score.toFixed(1)}
      <span className="text-xs font-normal opacity-70">/10</span>
    </div>
  );
}

function DayCell({
  dayLabel,
  rating,
  entryId,
}: {
  dayLabel: string;
  rating: number | null;
  entryId: string | null;
}) {
  const hasRating = rating != null && rating > 0;

  const inner = (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-colors",
        hasRating
          ? "border-border bg-card"
          : "border-dashed border-muted-foreground/20 bg-transparent",
        entryId && "hover:border-primary/40",
      )}
    >
      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
        {dayLabel}
      </span>
      {hasRating ? (
        <div className="flex items-center gap-0.5">
          <Star className="size-3.5 text-yellow-400" fill="currentColor" strokeWidth={1.5} />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground/40">—</span>
      )}
    </div>
  );

  if (entryId) {
    return (
      <Link href={`/journal/${entryId}`} className="flex-1">
        {inner}
      </Link>
    );
  }

  return <div className="flex-1">{inner}</div>;
}

type WeeklyScoreCardProps = {
  summary: WeeklySummary;
};

export function WeeklyScoreCard({ summary }: WeeklyScoreCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Weekly Summary</CardTitle>
          <CardDescription>{summary.weekLabel}</CardDescription>
        </div>
        {summary.scoreOutOf10 != null ? (
          <ScoreBadge score={summary.scoreOutOf10} />
        ) : (
          <span className="text-xs text-muted-foreground">No ratings yet</span>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {summary.days.map((day) => (
            <DayCell
              key={day.date.toISOString()}
              dayLabel={day.dayLabel}
              rating={day.entry?.rating ?? null}
              entryId={day.entry?.id ?? null}
            />
          ))}
        </div>
        {summary.ratedCount > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {summary.ratedCount} rated {summary.ratedCount === 1 ? "day" : "days"} ·
            avg {(summary.totalRating / summary.ratedCount).toFixed(1)} stars
          </p>
        )}
      </CardContent>
    </Card>
  );
}
