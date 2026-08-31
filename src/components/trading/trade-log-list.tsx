"use client";

import { useState } from "react";

import {
  TradeDetailCard,
  tradesOnSameDay,
  type TradeDetailData,
} from "@/components/trading/trade-detail-card";
import { TradeRow } from "@/components/trading/trade-row";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TradeLogListProps = {
  trades: TradeDetailData[];
};

export function TradeLogList({ trades }: TradeLogListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = trades.find((trade) => trade.id === activeId) ?? null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Dir</TableHead>
            <TableHead className="text-right">PnL</TableHead>
            <TableHead> </TableHead>
            <TableHead className="text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              selected={trade.id === activeId}
              onPreview={() => setActiveId(trade.id)}
            />
          ))}
        </TableBody>
      </Table>

      <Sheet open={activeId !== null} onOpenChange={(open) => !open && setActiveId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Daily summary</SheetTitle>
            <SheetDescription>
              {active
                ? `All trades on this day, starting from ${active.symbol}.`
                : "Day overview"}
            </SheetDescription>
          </SheetHeader>
          {active ? (
            <div className="mt-6">
              <TradeDetailCard
                trade={active}
                dayTrades={tradesOnSameDay(trades, active.date)}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
