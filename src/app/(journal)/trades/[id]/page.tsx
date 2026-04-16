import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { TradeDeleteButton } from "@/components/trading/trade-delete-button";
import { TradeForm } from "@/components/trading/trade-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type TradeEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TradeEntryPage({ params }: TradeEntryPageProps) {
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trades">Back to list</Link>
          </Button>
          <TradeDeleteButton tradeId={trade.id} />
        </div>
      </div>
      <TradeForm
        mode="edit"
        trade={{
          id: trade.id,
          symbol: trade.symbol,
          direction,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          size: trade.size,
          fees: trade.fees,
          session: trade.session,
          entryTime: trade.entryTime,
          notes: trade.notes,
          date: trade.date,
          tags: trade.tags,
        }}
      />
    </div>
  );
}
