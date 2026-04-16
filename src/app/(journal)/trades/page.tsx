import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PnlBadge } from "@/components/trading/pnl-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatListDate } from "@/lib/format";
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
            <CardDescription>Newest first.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatListDate(trade.date)}
                    </TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {trade.direction}
                    </TableCell>
                    <TableCell className="text-right">
                      <PnlBadge pnl={trade.pnl} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/trades/${trade.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
