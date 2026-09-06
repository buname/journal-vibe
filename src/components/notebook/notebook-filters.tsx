"use client";

import Link from "next/link";

import AnimatedBackground from "@/components/ui/animated-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotebookFilter } from "@/lib/notebook/parse-kind";

const filters: { key: NotebookFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "journal", label: "Journal" },
  { key: "trade", label: "Trades" },
  { key: "backtest", label: "Backtests" },
];

type NotebookFiltersProps = {
  active: NotebookFilter;
  activeTag?: string;
  tags: string[];
};

function buildNotebookHref(
  kind: NotebookFilter,
  tag: string | undefined,
): string {
  const params = new URLSearchParams();
  if (kind !== "all") {
    params.set("kind", kind);
  }
  if (tag) {
    params.set("tag", tag);
  }
  const query = params.toString();
  return query.length > 0 ? `/notebook?${query}` : "/notebook";
}

export function NotebookFilters({ active, activeTag, tags }: NotebookFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="inline-flex w-full max-w-xl rounded-xl border border-border/80 bg-muted/30 p-1.5">
        <AnimatedBackground
          className="rounded-lg bg-primary shadow-sm"
          defaultValue={active}
          transition={{
            type: "spring",
            bounce: 0.15,
            duration: 0.35,
          }}
        >
          {filters.map((filter) => (
            <Link
              key={filter.key}
              data-id={filter.key}
              href={buildNotebookHref(filter.key, activeTag)}
              className={cn(
                "relative z-10 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active === filter.key
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </AnimatedBackground>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tags
          </span>
          {tags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant={
                activeTag?.toLowerCase() === tag.toLowerCase()
                  ? "default"
                  : "outline"
              }
              className="h-7 rounded-full px-3 text-xs"
              asChild
            >
              <Link href={buildNotebookHref(active, tag)}>{tag}</Link>
            </Button>
          ))}
          {activeTag ? (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
              <Link href={buildNotebookHref(active, undefined)}>Clear tag</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
