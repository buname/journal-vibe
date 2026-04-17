import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BacktestForm } from "@/components/trading/backtest-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewBacktestPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Backtests
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">New backtest</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/backtests">Back to list</Link>
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick checklist</CardTitle>
            <CardDescription>What to include before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-muted-foreground">
            <p>- Market condition (trend, range, event)</p>
            <p>- Entry and invalidation logic</p>
            <p>- Sample size or confidence level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metric reminders</CardTitle>
            <CardDescription>Keep measurements consistent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-muted-foreground">
            <p>- Win rate = wins / total * 100</p>
            <p>- Expectancy (R) = avg win * win% - avg loss * loss%</p>
            <p>- Note fees/slippage assumptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tag ideas</CardTitle>
            <CardDescription>Use comma-separated labels.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>trend, breakout, mean-reversion, NY-open, high-volatility</p>
          </CardContent>
        </Card>
      </div>
      <BacktestForm mode="create" />
    </div>
  );
}
