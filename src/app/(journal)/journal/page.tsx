import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DbOfflineBanner } from "@/components/layout/db-offline-banner";
import { JournalEntryList } from "@/components/journal/journal-entry-list";
import { JournalStatsBento } from "@/components/journal/journal-stats-bento";
import { WeeklyScoreCard } from "@/components/journal/weekly-score-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { excerptFromContent } from "@/lib/journal/excerpt";
import {
  computeJournalStats,
} from "@/lib/journal/stats";
import { buildWeeklySummaries } from "@/lib/journal/weekly-score";

export default async function JournalListPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let entries: Awaited<ReturnType<typeof prisma.dailyJournal.findMany>> = [];
  let dbOffline = false;

  try {
    entries = await prisma.dailyJournal.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });
  } catch {
    dbOffline = true;
  }

  const weeklySummaries = buildWeeklySummaries(
    entries.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      rating: e.rating,
    })),
  );
  const [currentWeek, ...previousWeeks] = weeklySummaries;
  const stats = computeJournalStats(entries);
  const listEntries = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    date: entry.date,
    rating: entry.rating,
    tags: entry.tags,
    images: entry.images,
    excerpt: excerptFromContent(entry.content, 140),
  }));

  return (
    <div className="space-y-8">
      {dbOffline ? <DbOfflineBanner /> : null}
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

      {dbOffline ? null : entries.length === 0 ? (
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
          <JournalStatsBento stats={stats} />

          <div className="space-y-4">
            {currentWeek ? <WeeklyScoreCard summary={currentWeek} /> : null}
          </div>

          {previousWeeks.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Previous weeks</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {previousWeeks.map((summary) => (
                  <WeeklyScoreCard
                    key={summary.weekStart.toISOString()}
                    summary={summary}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <JournalEntryList entries={listEntries} />
        </>
      )}
    </div>
  );
}
