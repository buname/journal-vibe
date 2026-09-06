import { format } from "date-fns";
import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { DailySummaryCard } from "@/components/trading/daily-summary-card";
import { formatTradeDuration } from "@/components/trading/trade-card-utils";
import { TradeInteractiveCard } from "@/components/trading/trade-interactive-card";
import { TradeDeleteButton } from "@/components/trading/trade-delete-button";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ui/image-gallery";
import { prisma } from "@/lib/db";
import { formatListDate } from "@/lib/format";
import { parseTag } from "@/lib/tag-links";

type TradeEntryPageProps = {
  params: Promise<{ id: string }>;
};

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function price(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
    value,
  );
}

function toTradeDetail(trade: {
  id: string;
  symbol: string;
  direction: string;
  pnl: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
  rValue: number | null;
  fees: number;
  session: string | null;
  notes: string | null;
  images: string[];
  date: Date;
  entryTime: Date | null;
  exitTime: Date | null;
}) {
  return {
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
    exitTime: trade.exitTime?.toISOString() ?? null,
  };
}

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

  const dayStart = new Date(trade.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(trade.date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayTrades = await prisma.tradeLog.findMany({
    where: {
      userId: session.user.id,
      date: { gte: dayStart, lte: dayEnd },
    },
    orderBy: { date: "desc" },
  });

  const tradeDetail = toTradeDetail(trade);
  const dayTradeDetails = dayTrades.map(toTradeDetail);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Trades
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {trade.symbol}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatListDate(trade.date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trades">
              <ChevronLeft />
              Back
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/trades/${trade.id}/edit`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <TradeDeleteButton tradeId={trade.id} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:items-start">
        <div className="flex justify-center xl:justify-start">
          <TradeInteractiveCard trade={tradeDetail} size="large" />
        </div>
        <DailySummaryCard
          trades={dayTradeDetails}
          userName={session.user.name}
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Execution data
        </h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Detail label="Direction" value={trade.direction} />
          <Detail label="Entry" value={price(trade.entryPrice)} />
          <Detail label="Exit" value={price(trade.exitPrice)} />
          <Detail label="Stop" value={price(trade.stopPrice)} />
          <Detail label="Size" value={price(trade.size)} />
          <Detail label="Session" value={trade.session ?? "—"} />
          <Detail
            label="Entry time"
            value={
              trade.entryTime ? format(trade.entryTime, "MMM d, HH:mm:ss") : "—"
            }
          />
          <Detail
            label="Duration"
            value={
              formatTradeDuration(
                trade.entryTime?.toISOString() ?? null,
                trade.exitTime?.toISOString() ?? null,
              ) ?? "—"
            }
          />
          <Detail
            label="R"
            value={trade.rValue != null ? `${trade.rValue.toFixed(2)}R` : "—"}
          />
        </div>
      </div>

      {trade.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {trade.tags.map((rawTag, index) => {
            const parsed = parseTag(rawTag);
            if (!parsed.label) return null;
            const className =
              "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground";
            return parsed.sourceUrl ? (
              <a
                key={`${rawTag}-${index}`}
                href={parsed.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {parsed.label}
              </a>
            ) : (
              <span key={`${rawTag}-${index}`} className={className}>
                {parsed.label}
              </span>
            );
          })}
        </div>
      ) : null}

      {trade.notes ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Notes</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {trade.notes}
          </p>
        </div>
      ) : null}

      {trade.images.length > 1 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">More screenshots</h2>
          <ImageGallery images={trade.images.slice(1)} altLabel="Trade screenshot" />
        </div>
      ) : null}
    </div>
  );
}
