import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { TradeForm } from "@/components/trading/trade-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type TradeEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const trade = await prisma.tradeLog.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!trade) {
    notFound();
  }

  const direction =
    trade.direction === "LONG" || trade.direction === "SHORT"
      ? trade.direction
      : "LONG";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Trades
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Edit trade</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/trades/${trade.id}`}>Cancel</Link>
        </Button>
      </div>
      <TradeForm
        mode="edit"
        trade={{
          id: trade.id,
          symbol: trade.symbol,
          direction,
          instrumentType: trade.instrumentType,
          pointValue: trade.pointValue,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          stopPrice: trade.stopPrice,
          size: trade.size,
          fees: trade.fees,
          session: trade.session,
          entryTime: trade.entryTime,
          notes: trade.notes,
          date: trade.date,
          tags: trade.tags,
          images: trade.images,
        }}
      />
    </div>
  );
}
