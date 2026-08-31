"use client";

import { Eye } from "lucide-react";
import Link from "next/link";

import { PnlBadge } from "@/components/trading/pnl-badge";
import type { TradeDetailData } from "@/components/trading/trade-detail-card";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatListDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type TradeRowProps = {
  trade: TradeDetailData;
  selected?: boolean;
  onPreview: () => void;
};

export function TradeRow({ trade, selected, onPreview }: TradeRowProps) {
  return (
    <TableRow className={cn(selected && "bg-muted/60")}>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatListDate(new Date(trade.date))}
      </TableCell>
      <TableCell className="font-medium">{trade.symbol}</TableCell>
      <TableCell className="text-muted-foreground">{trade.direction}</TableCell>
      <TableCell className="text-right">
        <PnlBadge pnl={trade.pnl} />
      </TableCell>
      <TableCell>
        {trade.images.length > 0 ? (
          <div className="ml-4 h-9 w-14 overflow-hidden rounded border border-border/60 bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trade.images[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 text-muted-foreground"
            aria-label="View day summary"
            onClick={onPreview}
          >
            <Eye />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/trades/${trade.id}`}>Open</Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
