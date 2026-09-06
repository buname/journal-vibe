"use client";

import { ActivityHeatmapCard } from "@/components/ui/activity-heatmap-card";
import type { HeatmapDay } from "@/components/ui/activity-heatmap";

const JOURNAL_HEATMAP_COLORS = [
  "#f4f1ea",
  "#e8dcc8",
  "#d4b896",
  "#b8956a",
  "#8b6914",
];

type JournalActivityHeatmapProps = {
  data: HeatmapDay[];
};

export function JournalActivityHeatmap({ data }: JournalActivityHeatmapProps) {
  const total = data.reduce((sum, day) => sum + day.count, 0);
  const activeDays = data.filter((day) => day.count > 0).length;

  return (
    <ActivityHeatmapCard
      title="Writing rhythm"
      description="Last year of journal days — darker squares mean more entries that day."
      data={data}
      entryLabel="entries"
      emptyMessage="Your heatmap fills in as you write — one entry is enough to start."
      colors={JOURNAL_HEATMAP_COLORS}
      tierTotal={total}
      tierActiveDays={activeDays}
      stats={[
        { label: "active days", value: activeDays },
        { label: "total entries", value: total },
      ]}
      hint={
        total > 0
          ? "Hover a square to see that day — more writing deepens the color."
          : undefined
      }
    />
  );
}
