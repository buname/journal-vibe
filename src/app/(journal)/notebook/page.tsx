import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NotebookFilters } from "@/components/notebook/notebook-filters";
import { NotebookTimeline } from "@/components/notebook/notebook-timeline";
import { TimelineActivityHeatmap } from "@/components/notebook/timeline-activity-heatmap";
import { DbOfflineBanner } from "@/components/layout/db-offline-banner";
import { buildActivityHeatmap } from "@/lib/notebook/build-activity-heatmap";
import { buildNotebookTimeline } from "@/lib/notebook/build-timeline";
import { parseNotebookKind } from "@/lib/notebook/parse-kind";
import { parseTag } from "@/lib/tag-links";
import { prisma } from "@/lib/db";

type NotebookPageProps = {
  searchParams: Promise<{ kind?: string; tag?: string }>;
};

export default async function NotebookPage({ searchParams }: NotebookPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const kind = parseNotebookKind(params.kind);
  const tag = params.tag?.trim() ? params.tag.trim() : undefined;

  let journals: Awaited<ReturnType<typeof prisma.dailyJournal.findMany>> = [];
  let trades: Awaited<ReturnType<typeof prisma.tradeLog.findMany>> = [];
  let backtests: Awaited<ReturnType<typeof prisma.backtestNote.findMany>> = [];
  let dbOffline = false;

  try {
    [journals, trades, backtests] = await Promise.all([
      prisma.dailyJournal.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.tradeLog.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.backtestNote.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
    ]);
  } catch {
    dbOffline = true;
  }

  const merged = buildNotebookTimeline(journals, trades, backtests);
  const activityData = buildActivityHeatmap(journals, trades, backtests);
  const kindFiltered =
    kind === "all" ? merged : merged.filter((item) => item.kind === kind);
  const filtered =
    tag === undefined
      ? kindFiltered
      : kindFiltered.filter((item) =>
          item.tags.some(
            (itemTag) => parseTag(itemTag).label.toLowerCase() === tag.toLowerCase(),
          ),
        );

  const allTags = Array.from(
    new Set(
      merged.flatMap((item) =>
        item.tags
          .map((itemTag) => parseTag(itemTag).label)
          .map((itemTag) => itemTag.trim().toLowerCase()),
      ),
    ),
  )
    .filter((itemTag) => itemTag.length > 0)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-8">
      {dbOffline ? <DbOfflineBanner /> : null}
      <div className="space-y-4">
        <div>
          <h1 className="journal-page-title">Timeline</h1>
          <p className="journal-page-lead mt-1.5">
            Journals, fills, and backtests in the order of the day.
          </p>
        </div>
        <NotebookFilters active={kind} activeTag={tag} tags={allTags} />
      </div>
      {!dbOffline ? <TimelineActivityHeatmap data={activityData} /> : null}
      <NotebookTimeline items={filtered} activeKind={kind} />
    </div>
  );
}
