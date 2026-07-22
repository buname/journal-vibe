import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { JournalDeleteButton } from "@/components/editor/journal-delete-button";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ui/image-gallery";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { prisma } from "@/lib/db";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";

type JournalEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const entry = await prisma.dailyJournal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Journal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {entry.title}
          </h1>
          <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {formatListDate(entry.date)}
            <StarRatingDisplay value={entry.rating} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/journal">
              <ChevronLeft />
              Back
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/journal/${entry.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <JournalDeleteButton journalId={entry.id} />
        </div>
      </div>

      {entry.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((rawTag, index) => {
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

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {entry.content}
      </div>

      {entry.images.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Images</h2>
          <ImageGallery images={entry.images} altLabel="Journal image" />
        </div>
      ) : null}
    </div>
  );
}
