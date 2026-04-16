import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WeeklyScoreCard } from "@/components/journal/weekly-score-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { prisma } from "@/lib/db";
import { formatListDate } from "@/lib/format";
import { buildWeeklySummaries } from "@/lib/journal/weekly-score";
import { parseTag } from "@/lib/tag-links";

export default async function JournalListPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const entries = await prisma.dailyJournal.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const weeklySummaries = buildWeeklySummaries(
    entries.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      rating: e.rating,
    })),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily journal</h1>
          <p className="text-sm text-muted-foreground">
            Capture life and market notes in one running log.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/notebook">Timeline</Link>
          </Button>
          <Button asChild>
            <Link href="/journal/new">New entry</Link>
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No entries yet</CardTitle>
            <CardDescription>
              Create your first journal entry to start building your timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/journal/new">Write the first entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {weeklySummaries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Weekly scores
              </h2>
              {weeklySummaries.map((summary) => (
                <WeeklyScoreCard
                  key={summary.weekStart.toISOString()}
                  summary={summary}
                />
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">All entries</h2>
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/journal/${entry.id}`}
                        className="hover:underline"
                      >
                        {entry.title}
                      </Link>
                    </CardTitle>
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
                              >
                                {parsed.label}
                              </Link>
                            );
                          })}
                        </span>
                      ) : null}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/journal/${entry.id}`}>Open</Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
