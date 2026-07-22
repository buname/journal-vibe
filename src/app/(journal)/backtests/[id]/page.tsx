import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { BacktestDeleteButton } from "@/components/trading/backtest-delete-button";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ui/image-gallery";
import { prisma } from "@/lib/db";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";

type BacktestEntryPageProps = {
  params: Promise<{ id: string }>;
};

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export default async function BacktestEntryPage({
  params,
}: BacktestEntryPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const note = await prisma.backtestNote.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Backtests
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {note.strategy}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatListDate(note.date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/backtests">
              <ChevronLeft />
              Back
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/backtests/${note.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <BacktestDeleteButton backtestId={note.id} />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-5">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Detail label="Timeframe" value={note.timeframe} />
          <Detail label="Win rate" value={`${note.winRate.toFixed(1)}%`} />
          <Detail label="Expectancy" value={`${note.expectancy.toFixed(2)}R`} />
        </div>
      </div>

      {note.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((rawTag, index) => {
            const parsed = parseTag(rawTag);
            if (!parsed.label) return null;
            const className =
              "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground";
            return parsed.sourceUrl ? (
              <a
                key={`${rawTag}-${index}`}
                href={parsed.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {parsed.label}
              </a>
            ) : (
              <span key={`${rawTag}-${index}`} className={className}>
                {parsed.label}
              </span>
            );
          })}
        </div>
      ) : null}

      {note.notes ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Notes</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {note.notes}
          </p>
        </div>
      ) : null}

      {note.images.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Images</h2>
          <ImageGallery images={note.images} altLabel="Backtest screenshot" />
        </div>
      ) : null}
    </div>
  );
}
