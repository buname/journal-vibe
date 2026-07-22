import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
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
import { buildWeeklySummaries } from "@/lib/journal/weekly-score";

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
              <JournalEntryCard
                key={entry.id}
                entry={{
                  id: entry.id,
                  title: entry.title,
                  date: entry.date,
                  rating: entry.rating,
                  tags: entry.tags,
                  images: entry.images,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
