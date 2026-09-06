import type { ComponentType } from "react";
import {
  BookOpen,
  CalendarDays,
  Flame,
  ImageIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { JournalStats } from "@/lib/journal/stats";

type JournalStatsBentoProps = {
  stats: JournalStats;
};

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "default" | "warm" | "cool";
};

function StatCard({ label, value, hint, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_30px_-20px_rgba(61,90,128,0.22)] transition-colors hover:border-border",
        accent === "warm" && "border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-card",
        accent === "cool" && "border-primary/15 bg-gradient-to-br from-primary/[0.04] to-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div
          className={cn(
            "rounded-xl border p-2.5 text-muted-foreground transition-colors",
            accent === "warm" && "border-amber-500/20 bg-amber-500/10 text-amber-600",
            accent === "cool" && "border-primary/20 bg-primary/10 text-primary",
            accent === "default" && "border-border/80 bg-muted/40",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

export function JournalStatsBento({ stats }: JournalStatsBentoProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Total entries"
        value={String(stats.totalEntries)}
        hint={`${stats.activeDays} active ${stats.activeDays === 1 ? "day" : "days"}`}
        icon={BookOpen}
        accent="cool"
      />
      <StatCard
        label="Current streak"
        value={stats.streak > 0 ? `${stats.streak}d` : "—"}
        hint={
          stats.streak > 0
            ? "Consecutive days with a journal entry"
            : "Write today to start a streak"
        }
        icon={Flame}
        accent="warm"
      />
      <StatCard
        label="This week"
        value={String(stats.thisWeek)}
        hint={
          stats.withPhotos > 0
            ? `${stats.withPhotos} with photos`
            : "Entries since Monday"
        }
        icon={stats.withPhotos > 0 ? ImageIcon : CalendarDays}
      />
    </div>
  );
}
