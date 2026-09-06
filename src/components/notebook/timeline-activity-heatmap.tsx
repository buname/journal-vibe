"use client";

import { ActivityHeatmapCard } from "@/components/ui/activity-heatmap-card";
import type { HeatmapDay } from "@/components/ui/activity-heatmap";
import { summarizeActivityHeatmap } from "@/lib/notebook/build-activity-heatmap";

type TimelineActivityHeatmapProps = {
  data: HeatmapDay[];
};

export function TimelineActivityHeatmap({ data }: TimelineActivityHeatmapProps) {
  const summary = summarizeActivityHeatmap(data);

  return (
    <ActivityHeatmapCard
      title="Show up"
      description="From this month forward — Sep, Oct, Nov, Dec, then into 2027. Each square is a day you logged a trade, wrote a journal, or saved a backtest. Future days stay faded."
      data={data}
      entryLabel="touchpoints"
      emptyMessage="No activity yet — log a trade, write a journal day, or save a backtest to start your streak."
      tierTotal={summary.total}
      tierActiveDays={summary.activeDays}
    />
  );
}
