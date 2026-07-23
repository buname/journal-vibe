import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { BacktestForm } from "@/components/trading/backtest-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type BacktestEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BacktestEditPage({
  params,
}: BacktestEditPageProps) {
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit backtest</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/backtests/${note.id}`}>Cancel</Link>
        </Button>
      </div>
      <BacktestForm
        mode="edit"
        backtest={{
          id: note.id,
          strategy: note.strategy,
          timeframe: note.timeframe,
          direction: note.direction,
          instrumentType: note.instrumentType,
          entryPrice: note.entryPrice,
          stopPrice: note.stopPrice,
          winRate: note.winRate,
          expectancy: note.expectancy,
          notes: note.notes,
          date: note.date,
          tags: note.tags,
          images: note.images,
        }}
      />
    </div>
  );
}
