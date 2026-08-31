import { format } from "date-fns";
import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { PnlBadge } from "@/components/trading/pnl-badge";
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

  return (
    <div className="space-y-6">
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

      <div className="rounded-xl border border-border/70 bg-card p-5">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Detail label="Direction" value={trade.direction} />
          <Detail label="PnL" value={<PnlBadge pnl={trade.pnl} />} />
          <Detail
            label="R"
            value={trade.rValue != null ? `${trade.rValue.toFixed(2)}R` : "—"}
          />
          <Detail label="Entry" value={price(trade.entryPrice)} />
          <Detail label="Exit" value={price(trade.exitPrice)} />
          <Detail label="Stop" value={price(trade.stopPrice)} />
          <Detail label="Size" value={price(trade.size)} />
          <Detail label="Session" value={trade.session ?? "—"} />
          <Detail
            label="Entry time"
            value={
              trade.entryTime ? format(trade.entryTime, "MMM d, HH:mm") : "—"
            }
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

      {trade.images.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Images</h2>
          <ImageGallery images={trade.images} altLabel="Trade screenshot" />
        </div>
      ) : null}
    </div>
  );
}
