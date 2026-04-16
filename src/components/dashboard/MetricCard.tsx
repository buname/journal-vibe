import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral";
};

export function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <CardTitle
          className={cn(
            "text-2xl font-semibold tabular-nums",
            trend === "positive" && "text-emerald-600 dark:text-emerald-400",
            trend === "negative" && "text-rose-600 dark:text-rose-400",
            trend === "neutral" && "text-foreground",
          )}
        >
          {value}
        </CardTitle>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
