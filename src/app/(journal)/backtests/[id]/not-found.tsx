import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BacktestNotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Backtest not found</h1>
      <p className="text-sm text-muted-foreground">
        This note does not exist or belongs to another account.
      </p>
      <Button asChild>
        <Link href="/backtests">Back to backtests</Link>
      </Button>
    </div>
  );
}
