import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PnlBadge } from "@/components/trading/pnl-badge";
import { TradeLogList } from "@/components/trading/trade-log-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function TradesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const trades = await prisma.tradeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Trading
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Trade log</h1>
          <p className="text-sm text-muted-foreground">
            Structured executions with computed PnL (including fees).
          </p>
        </div>
        <Button asChild>
          <Link href="/trades/new">Log trade</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trades logged</CardTitle>
            <CardDescription>Total rows in your log.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {trades.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net PnL (sum)</CardTitle>
            <CardDescription>Across all listed trades.</CardDescription>
          </CardHeader>
          <CardContent>
            <PnlBadge pnl={totalPnL} className="text-base" />
          </CardContent>
        </Card>
      </div>

      {trades.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No trades yet</CardTitle>
            <CardDescription>
              Capture executions while memory is fresh—PnL is computed for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/trades/new">Log your first trade</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent trades</CardTitle>
            <CardDescription>
              The eye icon opens that day’s summary. Open goes to the trade.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <TradeLogList
              trades={trades.map((trade) => ({
                id: trade.id,
                symbol: trade.symbol,
                direction: trade.direction,
                pnl: trade.pnl,
                entryPrice: trade.entryPrice,
                exitPrice: trade.exitPrice,
                size: trade.size,
                rValue: trade.rValue,
                fees: trade.fees,
                session: trade.session,
                notes: trade.notes,
                images: trade.images,
                date: trade.date.toISOString(),
                entryTime: trade.entryTime?.toISOString() ?? null,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
