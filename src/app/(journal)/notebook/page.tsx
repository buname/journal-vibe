import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NotebookFilters } from "@/components/notebook/notebook-filters";
import { NotebookTimeline } from "@/components/notebook/notebook-timeline";
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

  const [journals, trades, backtests] = await Promise.all([
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

  const merged = buildNotebookTimeline(journals, trades, backtests);
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
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Notebook
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Journals, trades, and backtests in one reverse-chronological stream.
          </p>
        </div>
        <NotebookFilters active={kind} activeTag={tag} tags={allTags} />
      </div>
      <NotebookTimeline items={filtered} activeKind={kind} />
    </div>
  );
}
