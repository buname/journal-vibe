"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Sparkles, TrendingUp, Zap } from "lucide-react";

import {
  ActivityHeatmap,
  type HeatmapDay,
} from "@/components/ui/activity-heatmap";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type HeatmapStat = {
  label: string;
  value: number;
};

export type ActivityHeatmapCardProps = {
  title: string;
  description: string;
  data: HeatmapDay[];
  entryLabel: string;
  emptyMessage: string;
  stats?: HeatmapStat[];
  hint?: string;
  colors?: string[];
  tierTotal?: number;
  tierActiveDays?: number;
};

type ActivityTier = {
  label: string;
  hint: string;
  icon: typeof Flame;
  className: string;
};

function getActivityTier(total: number, activeDays: number): ActivityTier {
  if (total >= 50 || activeDays >= 20) {
    return {
      label: "On a roll",
      hint: "The grid is filling in — keep showing up.",
      icon: Flame,
      className: "border-amber-500/25 bg-amber-500/10 text-amber-700",
    };
  }
  if (total >= 20 || activeDays >= 10) {
    return {
      label: "Consistent",
      hint: "Steady touchpoints across the book.",
      icon: TrendingUp,
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
    };
  }
  if (total >= 5 || activeDays >= 3) {
    return {
      label: "Building",
      hint: "Every log adds another square.",
      icon: Zap,
      className: "border-primary/25 bg-primary/10 text-primary",
    };
  }
  return {
    label: "Getting started",
    hint: "One entry lights the first square.",
    icon: Sparkles,
    className: "border-border bg-muted/50 text-muted-foreground",
  };
}

function AnimatedStat({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const duration = 650;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduce]);

  return (
    <div className="text-center sm:text-left">
      <p className="text-lg font-semibold tabular-nums tracking-tight">{display}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ActivityHeatmapCard({
  title,
  description,
  data,
  entryLabel,
  emptyMessage,
  stats = [],
  hint,
  colors,
  tierTotal,
  tierActiveDays,
}: ActivityHeatmapCardProps) {
  const total = tierTotal ?? data.reduce((sum, day) => sum + day.count, 0);
  const activeDays =
    tierActiveDays ?? data.filter((day) => day.count > 0).length;
  const tier = getActivityTier(total, activeDays);
  const TierIcon = tier.icon;

  return (
    <Card className="overflow-visible border-border/70">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </motion.div>
          {total > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge
                variant="outline"
                className={cn("gap-1.5 px-2.5 py-1 text-xs font-medium", tier.className)}
              >
                <TierIcon className="size-3.5" />
                {tier.label}
              </Badge>
            </motion.div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="overflow-visible">
        {total === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </motion.p>
        ) : (
          <>
            <ActivityHeatmap
              data={data}
              entryLabel={entryLabel}
              colors={colors}
            />
            {stats.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-4"
              >
                {stats.map((stat) => (
                  <AnimatedStat
                    key={stat.label}
                    value={stat.value}
                    label={stat.label}
                  />
                ))}
              </motion.div>
            ) : null}
            {hint ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 text-[11px] text-muted-foreground"
              >
                {hint}
              </motion.p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
