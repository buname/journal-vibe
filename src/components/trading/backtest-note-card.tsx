"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageThumbs } from "@/components/ui/image-thumbs";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";

type BacktestNoteCardProps = {
  note: {
    id: string;
    strategy: string;
    timeframe: string;
    winRate: number;
    expectancy: number;
    date: Date;
    tags: string[];
    images: string[];
  };
};

export function BacktestNoteCard({ note }: BacktestNoteCardProps) {
  const router = useRouter();
  const href = `/backtests/${note.id}`;

  return (
    <Card
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(href);
      }}
      tabIndex={0}
      role="link"
      className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">{note.strategy}</CardTitle>
          <CardDescription>
            {formatListDate(note.date)} · {note.timeframe} · Win{" "}
            {note.winRate.toFixed(1)}% · E {note.expectancy.toFixed(2)}R
          </CardDescription>
          {note.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {note.tags.map((rawTag, index) => {
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
                      onClick={(event) => event.stopPropagation()}
                    >
                      {parsed.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={`${rawTag}-${index}`}
                    href={`/notebook?tag=${encodeURIComponent(parsed.label.toLowerCase())}`}
                    className={className}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {parsed.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          onClick={(event) => event.stopPropagation()}
        >
          <Link href={href}>Open</Link>
        </Button>
      </CardHeader>
      {note.images.length > 0 ? (
        <CardContent className="pt-0">
          <ImageThumbs images={note.images} />
        </CardContent>
      ) : null}
    </Card>
  );
}
