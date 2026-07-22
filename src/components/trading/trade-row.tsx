"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PnlBadge } from "@/components/trading/pnl-badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatListDate } from "@/lib/format";

type TradeRowProps = {
  trade: {
    id: string;
    date: Date;
    symbol: string;
    direction: string;
    pnl: number;
    images: string[];
  };
};

export function TradeRow({ trade }: TradeRowProps) {
  const router = useRouter();
  const href = `/trades/${trade.id}`;

  return (
    <TableRow
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(href);
      }}
      tabIndex={0}
      role="link"
      className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatListDate(trade.date)}
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {trade.images.length > 0 ? (
            <div className="h-8 w-12 shrink-0 overflow-hidden rounded border border-border/60 bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trade.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <span>{trade.symbol}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{trade.direction}</TableCell>
      <TableCell className="text-right">
        <PnlBadge pnl={trade.pnl} />
      </TableCell>
      <TableCell
        className="text-right"
        onClick={(event) => event.stopPropagation()}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href={href}>Open</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
