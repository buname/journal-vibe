import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BacktestForm } from "@/components/trading/backtest-form";
import { Button } from "@/components/ui/button";

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
      <BacktestForm mode="create" />
    </div>
  );
}
