"use client";

import { format } from "date-fns";
import { toBlob } from "html-to-image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";

import type { TradeDetailData } from "@/components/trading/trade-detail-card";
import {
  formatPnl,
  formatPrice,
  formatTradeDuration,
  isTradeDraft,
  shareFileName,
  tradeAccent,
} from "@/components/trading/trade-card-utils";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TradeInteractiveCardProps = {
  className?: string;
  preview?: boolean;
  showDownloadAction?: boolean;
  showFooterLink?: boolean;
  size?: "default" | "large";
  trade: TradeDetailData;
};

export function TradeListCard({
  className,
  onClick,
  selected,
  trade,
}: {
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  trade: TradeDetailData;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState(
    "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  );
  const accent = tradeAccent(trade.pnl);
  const when = new Date(trade.date);
  const entryWhen = trade.entryTime ? new Date(trade.entryTime) : null;
  const exitWhen = trade.exitTime ? new Date(trade.exitTime) : null;
  const duration = formatTradeDuration(trade.entryTime, trade.exitTime);
  const direction = trade.direction === "SHORT" ? "SHORT" : "LONG";
  const draft = isTradeDraft(trade);

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current || reduceMotion) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    setTilt(
      `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) scale3d(1.01,1.01,1.01)`,
    );
  };

  const handleMouseLeave = () => {
    setTilt("perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: tilt, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.35rem] border bg-card text-left transition-[border-color,box-shadow] duration-200",
        "hover:shadow-[0_20px_50px_-28px_hsl(var(--foreground)/0.22)]",
        selected
          ? "border-primary/40 ring-2 ring-primary/15"
          : "border-border/60 hover:border-border",
        className,
      )}
    >
      <Spotlight
        className="from-primary/30 via-primary/12 to-transparent blur-2xl"
        size={180}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accent === "win" && "from-emerald-500/[0.06] via-transparent to-transparent",
          accent === "loss" && "from-rose-500/[0.06] via-transparent to-transparent",
        )}
      />

      <div className="relative z-[1] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {format(when, "MMM d, yyyy")}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight">{trade.symbol}</h3>
              <DirectionBadge direction={direction} />
            </div>
          </div>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums tracking-tight",
              !draft && accent === "win" && "text-emerald-600",
              !draft && accent === "loss" && "text-rose-600",
              draft && "text-muted-foreground",
            )}
          >
            {draft ? "—" : formatPnl(trade.pnl, true)}
          </p>
        </div>

        <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
          {draft ? (
            <p className="text-sm text-muted-foreground">Draft trade</p>
          ) : (
            <p className="text-sm font-medium tabular-nums text-foreground">
              {formatPrice(trade.entryPrice)}
              <span className="mx-2 text-muted-foreground">→</span>
              {formatPrice(trade.exitPrice)}
              <span className="ml-2 text-muted-foreground">· {trade.size}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {!draft && trade.rValue != null ? (
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  trade.rValue >= 0 ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {trade.rValue >= 0 ? "+" : ""}
                {trade.rValue.toFixed(2)}R
              </span>
            ) : null}
            {entryWhen ? <span>In {format(entryWhen, "HH:mm")}</span> : null}
            {exitWhen ? <span>Out {format(exitWhen, "HH:mm")}</span> : null}
            {duration ? <span className="font-medium text-foreground">{duration}</span> : null}
            {trade.session ? <span className="capitalize">{trade.session.toLowerCase()}</span> : null}
          </div>
        </div>

        {trade.images[0] ? (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trade.images[0]}
              alt=""
              className="h-28 w-full object-contain object-center"
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function TradeInteractiveCard({
  className,
  preview = false,
  showDownloadAction = true,
  showFooterLink = true,
  size = "default",
  trade,
}: TradeInteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState(
    "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  );
  const [sharing, setSharing] = useState(false);

  const accent = tradeAccent(trade.pnl);
  const isLarge = preview || size === "large";
  const when = new Date(trade.date);
  const entryWhen = trade.entryTime ? new Date(trade.entryTime) : null;
  const exitWhen = trade.exitTime ? new Date(trade.exitTime) : null;
  const duration = formatTradeDuration(trade.entryTime, trade.exitTime);
  const imageUrl = trade.images[0];
  const direction = trade.direction === "SHORT" ? "SHORT" : "LONG";
  const hasImage = Boolean(imageUrl);
  const canDownload = showDownloadAction && !preview;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || reduceMotion || sharing) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    const intensity = hasImage ? 1 : 0.75;
    setTilt(
      `perspective(1100px) rotateX(${y * -5 * intensity}deg) rotateY(${x * 6 * intensity}deg) scale3d(1.01,1.01,1.01)`,
    );
  };

  const handleMouseLeave = () => {
    if (!sharing) {
      setTilt("perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    }
  };

  const captureCard = async () => {
    const node = shareRef.current;
    if (!node) throw new Error("Card not ready");

    setSharing(true);
    setTilt("perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      return await toBlob(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await captureCard();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = shareFileName(trade);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Card saved as PNG");
    } catch {
      toast.error("Could not export card");
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        hasImage
          ? isLarge
            ? "max-w-[min(92vw,640px)]"
            : "max-w-[min(92vw,560px)]"
          : "max-w-[min(92vw,480px)]",
        className,
      )}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: tilt, transformStyle: "preserve-3d" }}
        layout
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={hasImage ? "image-card" : "minimal-card"}
            ref={shareRef}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative overflow-hidden bg-card",
              hasImage
                ? "rounded-[1.4rem] border border-border/80 shadow-[0_24px_60px_-32px_hsl(var(--foreground)/0.2)]"
                : "rounded-[1.25rem] border border-border/60 shadow-[0_12px_36px_-24px_hsl(var(--foreground)/0.16)]",
            )}
          >
            <Spotlight
              className="from-primary/35 via-primary/14 to-transparent blur-2xl"
              size={hasImage ? 220 : 180}
            />
            {hasImage ? (
              <TradeCardWithImage
                accent={accent}
                direction={direction}
                entryWhen={entryWhen}
                exitWhen={exitWhen}
                duration={duration}
                imageUrl={imageUrl!}
                isLarge={isLarge}
                reduceMotion={reduceMotion}
                trade={trade}
                when={when}
              />
            ) : (
              <TradeCardMinimal
                accent={accent}
                direction={direction}
                duration={duration}
                entryWhen={entryWhen}
                exitWhen={exitWhen}
                reduceMotion={reduceMotion}
                trade={trade}
                when={when}
                variant="hero"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {canDownload ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full text-xs"
            disabled={sharing}
            onClick={handleDownload}
          >
            <Download className="size-4" />
            Download
          </Button>
        </div>
      ) : null}

      {showFooterLink && !preview ? (
        <Button asChild className="mt-3 w-full" size="sm" variant="secondary">
          <Link href={`/trades/${trade.id}`}>Open full trade</Link>
        </Button>
      ) : null}
    </div>
  );
}

function DirectionBadge({ direction }: { direction: string }) {
  const isLong = direction === "LONG";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        isLong ? "bg-emerald-500/12 text-emerald-700" : "bg-rose-500/12 text-rose-700",
      )}
    >
      {isLong ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {direction}
    </span>
  );
}

function TradeCardMinimal({
  accent,
  direction,
  duration,
  entryWhen,
  exitWhen,
  reduceMotion,
  trade,
  variant = "default",
  when,
}: {
  accent: "win" | "loss" | "neutral";
  direction: string;
  duration: string | null;
  entryWhen: Date | null;
  exitWhen: Date | null;
  reduceMotion: boolean | null;
  trade: TradeDetailData;
  variant?: "default" | "hero";
  when: Date;
}) {
  const draft = isTradeDraft(trade);
  const isHero = variant === "hero";

  return (
    <div className={cn("relative z-[1]", isHero ? "p-7 sm:p-9" : "p-6")}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accent === "win" && "from-emerald-500/[0.07] via-transparent to-transparent",
          accent === "loss" && "from-rose-500/[0.07] via-transparent to-transparent",
          accent === "neutral" && "from-primary/[0.05] via-transparent to-transparent",
        )}
      />

      <div className="relative flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {format(when, "MMM d, yyyy")}
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <h3 className={cn("font-bold tracking-tight", isHero ? "text-4xl" : "text-xl")}>
              {trade.symbol}
            </h3>
            <DirectionBadge direction={direction} />
          </div>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Trade detail
          </p>
        </div>
        <motion.p
          key={trade.pnl}
          initial={reduceMotion ? false : { scale: 0.94, opacity: 0.75 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className={cn(
            "font-bold tabular-nums tracking-tight",
            isHero ? "text-4xl sm:text-[2.75rem]" : "text-2xl",
            !draft && accent === "win" && "text-emerald-600",
            !draft && accent === "loss" && "text-rose-600",
            draft && "text-muted-foreground",
          )}
        >
          {draft ? "—" : formatPnl(trade.pnl, true)}
        </motion.p>
      </div>

      {draft ? (
        <p className="relative mt-8 text-sm text-muted-foreground">
          Entry, exit, and size will show here as you fill the form.
        </p>
      ) : (
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
          <StatTile label="Entry" value={formatPrice(trade.entryPrice)} sub={entryWhen ? format(entryWhen, "HH:mm:ss") : undefined} />
          <StatTile label="Exit" value={formatPrice(trade.exitPrice)} sub={exitWhen ? format(exitWhen, "HH:mm:ss") : undefined} />
          <StatTile label="Qty" value={formatQty(trade.size)} />
          <StatTile label="Duration" value={duration ?? "—"} />
          <StatTile
            label="R/R"
            value={
              trade.rValue != null
                ? `${trade.rValue >= 0 ? "+" : ""}${trade.rValue.toFixed(2)}R`
                : "—"
            }
            tone={
              trade.rValue != null
                ? trade.rValue >= 0
                  ? "win"
                  : "loss"
                : undefined
            }
            className="sm:col-span-2"
          />
        </div>
      )}

      <footer className="relative mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground">
        <span className="capitalize">{trade.session?.toLowerCase() ?? format(when, "EEEE")}</span>
        <time className="tabular-nums" dateTime={trade.date}>
          {format(when, "MMM d, yyyy")}
        </time>
      </footer>
    </div>
  );
}

function formatQty(size: number) {
  return Number.isInteger(size) ? String(size) : String(size);
}

function StatTile({
  className,
  label,
  sub,
  tone,
  value,
}: {
  className?: string;
  label: string;
  sub?: string;
  tone?: "win" | "loss";
  value: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums text-foreground",
          tone === "win" && "text-emerald-600",
          tone === "loss" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub ? <p className="text-[11px] tabular-nums text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function TradeCardWithImage({
  accent,
  direction,
  duration,
  entryWhen,
  exitWhen,
  imageUrl,
  isLarge,
  reduceMotion,
  trade,
  when,
}: {
  accent: "win" | "loss" | "neutral";
  direction: string;
  duration: string | null;
  entryWhen: Date | null;
  exitWhen: Date | null;
  imageUrl: string;
  isLarge: boolean;
  reduceMotion: boolean | null;
  trade: TradeDetailData;
  when: Date;
}) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b opacity-70",
          accent === "win" && "from-emerald-500/12 to-transparent",
          accent === "loss" && "from-rose-500/12 to-transparent",
          accent === "neutral" && "from-primary/10 to-transparent",
        )}
      />

      <div
        className={cn(
          "relative z-[1] flex flex-col",
          isLarge ? "gap-3 p-4 sm:p-5" : "gap-5 p-6 sm:gap-6 sm:p-8",
        )}
      >
        <header className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h3
                className={cn(
                  "font-bold tracking-tight text-foreground",
                  isLarge ? "text-xl sm:text-2xl" : "text-3xl sm:text-[2.35rem]",
                )}
              >
                {trade.symbol}
              </h3>
              <DirectionBadge direction={direction} />
            </div>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trade detail
            </p>
          </div>

          <div className="shrink-0 text-right">
            <motion.p
              key={trade.pnl}
              initial={reduceMotion ? false : { scale: 0.92, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={cn(
                "font-bold tabular-nums tracking-tight",
                isLarge ? "text-xl sm:text-2xl" : "text-3xl sm:text-[2.5rem]",
                accent === "win" && "text-emerald-600",
                accent === "loss" && "text-rose-600",
                accent === "neutral" && "text-foreground",
              )}
            >
              {formatPnl(trade.pnl, true)}
            </motion.p>
          </div>
        </header>

        <div
          className={cn(
            "grid gap-3",
            isLarge
              ? "lg:grid-cols-[minmax(0,8.75rem)_1fr] lg:items-stretch"
              : "gap-4 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-5",
          )}
        >
          <aside
            className={cn(
              "space-y-0 divide-y divide-border/50 rounded-2xl border border-border/70 bg-muted/35",
              isLarge ? "p-3" : "p-4",
            )}
          >
            <DetailRow
              compact={isLarge}
              label="Entry"
              value={formatPrice(trade.entryPrice)}
              sub={entryWhen ? format(entryWhen, "HH:mm:ss") : undefined}
            />
            <DetailRow
              compact={isLarge}
              label="Exit"
              value={formatPrice(trade.exitPrice)}
              sub={exitWhen ? format(exitWhen, "HH:mm:ss") : undefined}
            />
            <DetailRow compact={isLarge} label="Qty" value={formatQty(trade.size)} />
            <DetailRow compact={isLarge} label="Duration" value={duration ?? "—"} />
            <DetailRow
              compact={isLarge}
              label="Net P&L"
              value={formatPnl(trade.pnl, true)}
              tone={accent}
            />
            <DetailRow
              compact={isLarge}
              label="R/R"
              value={
                trade.rValue != null
                  ? `${trade.rValue >= 0 ? "+" : ""}${trade.rValue.toFixed(2)}R`
                  : "—"
              }
              tone={
                trade.rValue != null
                  ? trade.rValue >= 0
                    ? "win"
                    : "loss"
                  : undefined
              }
            />
          </aside>

          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/10",
              isLarge
                ? "min-h-[9rem] lg:min-h-0 lg:h-full"
                : "min-h-[min(48vw,300px)]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${trade.symbol} trade screenshot`}
              decoding="sync"
              className={cn(
                "object-contain object-center",
                isLarge
                  ? "max-h-[min(26vh,190px)] w-full lg:max-h-full"
                  : "h-full w-full",
              )}
            />
          </div>
        </div>

        <footer
          className={cn(
            "flex items-center justify-between gap-3 border-t border-border/60 text-xs text-muted-foreground",
            isLarge ? "pt-3" : "pt-5",
          )}
        >
          <time className="tabular-nums" dateTime={trade.date}>
            {format(when, "MMMM d, yyyy")}
          </time>
          {trade.session ? (
            <span className="rounded-full bg-primary/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {trade.session}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wide">
              {format(when, "EEEE")}
            </span>
          )}
        </footer>
      </div>
    </>
  );
}

function DetailRow({
  compact,
  label,
  sub,
  tone,
  value,
}: {
  compact?: boolean;
  label: string;
  sub?: string;
  tone?: "win" | "loss" | "neutral";
  value: string;
}) {
  return (
    <div className={cn(compact ? "py-1.5" : "py-2.5", "first:pt-0 last:pb-0")}>
      <p
        className={cn(
          "font-semibold uppercase tracking-[0.12em] text-muted-foreground",
          compact ? "text-[9px]" : "text-[10px]",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-semibold tabular-nums text-foreground",
          compact ? "text-sm" : "text-[15px]",
          tone === "win" && "text-emerald-600",
          tone === "loss" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub ? (
        <p className="text-[10px] tabular-nums text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  );
}
