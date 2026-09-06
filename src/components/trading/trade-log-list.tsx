"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { TradeDetailData } from "@/components/trading/trade-detail-card";
import {
  TradeInteractiveCard,
  TradeListCard,
} from "@/components/trading/trade-interactive-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TradeLogListProps = {
  initialOpenTradeId?: string;
  showSavedBanner?: boolean;
  trades: TradeDetailData[];
};

export function TradeLogList({
  initialOpenTradeId,
  showSavedBanner,
  trades,
}: TradeLogListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = trades.find((trade) => trade.id === activeId) ?? null;
  const dialogWide = Boolean(active?.images.length);

  useEffect(() => {
    if (initialOpenTradeId) {
      setActiveId(initialOpenTradeId);
    }
  }, [initialOpenTradeId]);

  return (
    <>
      {showSavedBanner ? (
        <p className="mb-4 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
          Trade logged — your card is ready below.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trades.map((trade) => (
          <TradeListCard
            key={trade.id}
            trade={trade}
            selected={trade.id === activeId}
            onClick={() => setActiveId(trade.id)}
          />
        ))}
      </div>

      <Dialog open={activeId !== null} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent
          className={cn(
            "max-h-[90vh] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none",
            dialogWide
              ? "max-w-[min(92vw,640px)] sm:max-w-[min(92vw,640px)]"
              : "max-w-[min(92vw,480px)] sm:max-w-[min(92vw,480px)]",
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Trade card</DialogTitle>
            <DialogDescription>Interactive trade summary card</DialogDescription>
          </DialogHeader>
          {active ? (
            <div className="flex flex-col items-center gap-2.5">
              <TradeInteractiveCard
                trade={active}
                size="large"
                showFooterLink={false}
              />
              <div
                className={cn(
                  "flex w-full gap-2",
                  dialogWide ? "max-w-[min(92vw,640px)]" : "max-w-[min(92vw,480px)]",
                )}
              >
                <Button asChild className="h-9 flex-1 text-xs" variant="secondary">
                  <Link href={`/trades/${active.id}`}>Full details</Link>
                </Button>
                <Button
                  className="h-9 flex-1 text-xs"
                  type="button"
                  variant="outline"
                  onClick={() => setActiveId(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
