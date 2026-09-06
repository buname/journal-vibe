"use client";

import { useMemo, useState } from "react";

import type { TradeDetailData } from "@/components/trading/trade-detail-card";
import { TradeLogList } from "@/components/trading/trade-log-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeverSwitch } from "@/components/ui/lever-switch";

type RecentTradesCardProps = {
  initialOpenTradeId?: string;
  showSavedBanner?: boolean;
  trades: TradeDetailData[];
};

export function RecentTradesCard({
  initialOpenTradeId,
  showSavedBanner,
  trades,
}: RecentTradesCardProps) {
  const [withImages, setWithImages] = useState(true);

  const filteredTrades = useMemo(
    () =>
      trades.filter((trade) =>
        withImages ? trade.images.length > 0 : trade.images.length === 0,
      ),
    [trades, withImages],
  );


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle>Recent trades</CardTitle>
            <CardDescription>
              Tap a card to open the full snapshot. Download from the modal.
            </CardDescription>
          </div>

          <LeverSwitch
            checked={withImages}
            onCheckedChange={setWithImages}
            aria-label={
              withImages
                ? "Showing trades with chart screenshots"
                : "Showing trades without images"
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredTrades.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            {withImages
              ? "No trades with chart screenshots yet."
              : "No text-only trades — flip the lever for screenshots."}
          </p>
        ) : (
          <TradeLogList
            initialOpenTradeId={initialOpenTradeId}
            showSavedBanner={showSavedBanner}
            trades={filteredTrades}
          />
        )}
      </CardContent>
    </Card>
  );
}
