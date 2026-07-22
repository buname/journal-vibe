"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageThumbs } from "@/components/ui/image-thumbs";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";

type JournalEntryCardProps = {
  entry: {
    id: string;
    title: string;
    date: Date;
    rating: number | null;
    tags: string[];
    images: string[];
  };
};

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const router = useRouter();
  const href = `/journal/${entry.id}`;

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
          <CardTitle className="text-lg">{entry.title}</CardTitle>
          <CardDescription>
            <span className="flex items-center gap-2">
              {formatListDate(entry.date)}
              <StarRatingDisplay value={entry.rating} />
            </span>
            {entry.tags.length > 0 ? (
              <span className="block pt-1 text-xs">
                {entry.tags.map((rawTag, index) => {
                  const parsed = parseTag(rawTag);
                  if (!parsed.label) return null;
                  const className =
                    "mr-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground";

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
              </span>
            ) : null}
          </CardDescription>
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
      {entry.images.length > 0 ? (
        <CardContent className="pt-0">
          <ImageThumbs images={entry.images} />
        </CardContent>
      ) : null}
    </Card>
  );
}
