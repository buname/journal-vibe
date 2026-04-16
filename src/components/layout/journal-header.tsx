import Link from "next/link";

import { auth } from "@/auth";
import { DailyPerspectiveBar } from "@/components/layout/daily-perspective-bar";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export async function JournalHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/notebook"
            className="shrink-0 text-[15px] font-bold tracking-tight text-foreground"
          >
            Trading &amp; Life Journal
          </Link>
          <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1 overflow-x-auto text-[13px] font-medium text-muted-foreground">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notebook">Timeline</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/journal">Journal</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trades">Trades</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/backtests">Backtests</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
        {session?.user ? <UserMenu user={session.user} /> : null}
      </div>
      <DailyPerspectiveBar />
    </header>
  );
}
