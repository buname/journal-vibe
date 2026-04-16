import Link from "next/link";

import { PnlBadge } from "@/components/trading/pnl-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { formatListDate } from "@/lib/format";
import type { NotebookFilter } from "@/lib/notebook/parse-kind";
import { parseTag } from "@/lib/tag-links";
import type { NotebookTimelineItem } from "@/types/notebook";

function tagHref(tag: string, activeKind: NotebookFilter): string {
  const params = new URLSearchParams();
  if (activeKind !== "all") {
    params.set("kind", activeKind);
  }
  params.set("tag", tag);
  return `/notebook?${params.toString()}`;
}

function TagList({ tags, activeKind }: { tags: string[]; activeKind: NotebookFilter }) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {tags.map((rawTag, index) => {
        const parsed = parseTag(rawTag);
        if (!parsed.label) return null;

        const className =
          "inline-flex rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground";

        if (parsed.sourceUrl) {
          return (
            <a
              key={`${rawTag}-${index}`}
              href={parsed.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={className}
              title="Open source link"
            >
              {parsed.label}
            </a>
          );
        }

        return (
          <Link
            key={`${rawTag}-${index}`}
            href={tagHref(parsed.label, activeKind)}
            className={className}
          >
            {parsed.label}
          </Link>
        );
      })}
    </div>
  );
}

function TimelineCard({
  item,
  activeKind,
}: {
  item: NotebookTimelineItem;
  activeKind: NotebookFilter;
}) {
  if (item.kind === "journal") {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                <Link href={`/journal/${item.id}`} className="hover:underline">
                  {item.title}
                </Link>
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2">
                  {formatListDate(item.date)}
                  <StarRatingDisplay value={item.rating} />
                </span>
              </CardDescription>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Journal
            </span>
          </div>
          <TagList tags={item.tags} activeKind={activeKind} />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {item.excerpt}
        </CardContent>
      </Card>
    );
  }

  if (item.kind === "trade") {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                <Link href={`/trades/${item.id}`} className="hover:underline">
                  {item.symbol}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {item.direction}
                  </span>
                </Link>
              </CardTitle>
              <CardDescription>{formatListDate(item.date)}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              <PnlBadge pnl={item.pnl} />
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Trade
              </span>
            </div>
          </div>
          <TagList tags={item.tags} activeKind={activeKind} />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              <Link href={`/backtests/${item.id}`} className="hover:underline">
                {item.strategy}
              </Link>
            </CardTitle>
            <CardDescription>
              {formatListDate(item.date)} · {item.timeframe} · Win{" "}
              {item.winRate.toFixed(1)}% · E {item.expectancy.toFixed(2)}R
            </CardDescription>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Backtest
          </span>
        </div>
        <TagList tags={item.tags} activeKind={activeKind} />
      </CardHeader>
    </Card>
  );
}

type NotebookTimelineProps = {
  items: NotebookTimelineItem[];
  activeKind: NotebookFilter;
};

export function NotebookTimeline({ items, activeKind }: NotebookTimelineProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No items yet</CardTitle>
          <CardDescription>
            Start by adding a journal entry, a trade, or a backtest note.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Link className="underline" href="/journal/new">
            New journal
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link className="underline" href="/trades/new">
            Log trade
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link className="underline" href="/backtests/new">
            New backtest
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
          <TimelineCard
            key={`${item.kind}-${item.id}`}
            item={item}
            activeKind={activeKind}
          />
      ))}
    </div>
  );
}
