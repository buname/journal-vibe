import { cn } from "@/lib/utils";

type PnlBadgeProps = {
  pnl: number;
  className?: string;
};

export function PnlBadge({ pnl, className }: PnlBadgeProps) {
  const tone =
    pnl > 0
      ? "text-emerald-700 dark:text-emerald-400"
      : pnl < 0
        ? "text-red-700 dark:text-red-400"
        : "text-muted-foreground";

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(pnl);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-semibold tabular-nums text-xs",
        tone,
        className,
      )}
    >
      {formatted}
    </span>
  );
}
