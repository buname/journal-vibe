import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";
import { prisma } from "@/lib/db";

export default async function BacktestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const backtests = await prisma.backtestNote.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Research
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Backtest notes
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured snapshots of strategy studies.
          </p>
        </div>
        <Button asChild>
          <Link href="/backtests/new">New backtest</Link>
        </Button>
      </div>

      {backtests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No backtests yet</CardTitle>
            <CardDescription>
              Capture win rate, expectancy, and qualitative notes alongside your
              live journal and trades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/backtests/new">Create first note</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {backtests.map((note) => (
            <Card key={note.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/backtests/${note.id}`}
                      className="hover:underline"
                    >
                      {note.strategy}
                    </Link>
                  </CardTitle>
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
                    </div>
                  ) : null}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/backtests/${note.id}`}>Edit</Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
