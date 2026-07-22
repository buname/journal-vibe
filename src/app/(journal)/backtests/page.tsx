import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BacktestNoteCard } from "@/components/trading/backtest-note-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const totalBacktests = backtests.length;
  const averageWinRate =
    totalBacktests === 0
      ? 0
      : backtests.reduce((sum, note) => sum + note.winRate, 0) / totalBacktests;
  const averageExpectancy =
    totalBacktests === 0
      ? 0
      : backtests.reduce((sum, note) => sum + note.expectancy, 0) /
        totalBacktests;
  const positiveExpectancyCount = backtests.filter(
    (note) => note.expectancy > 0,
  ).length;
  const positiveExpectancyRate =
    totalBacktests === 0 ? 0 : (positiveExpectancyCount / totalBacktests) * 100;

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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
            <CardDescription>Total studies logged.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{totalBacktests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">Avg win rate</CardTitle>
            <CardDescription>Across all backtests.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {averageWinRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">Avg expectancy</CardTitle>
            <CardDescription>Mean R per setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {averageExpectancy.toFixed(2)}R
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">Positive expectancy</CardTitle>
            <CardDescription>Setups above 0R.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {positiveExpectancyRate.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {backtests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No backtests yet</CardTitle>
            <CardDescription>
              Start with one strategy idea and record assumptions before your next
              live sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>- Define market condition and timeframe.</p>
              <p>- Log expected edge as win rate + expectancy.</p>
              <p>- Add tags to connect it back to trades and journal notes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/backtests/new">Create first note</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trades">Go to trades</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {backtests.map((note) => (
            <BacktestNoteCard
              key={note.id}
              note={{
                id: note.id,
                strategy: note.strategy,
                timeframe: note.timeframe,
                winRate: note.winRate,
                expectancy: note.expectancy,
                date: note.date,
                tags: note.tags,
                images: note.images,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
