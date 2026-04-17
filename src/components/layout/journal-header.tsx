import Link from "next/link";

import { auth } from "@/auth";
import { DailyPerspectiveBar } from "@/components/layout/daily-perspective-bar";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function JournalHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link
            href="/notebook"
            className="min-w-0 truncate text-sm font-bold tracking-tight text-foreground sm:text-[15px]"
          >
            Trading &amp; Life Journal
          </Link>
          {session?.user ? <UserMenu user={session.user} /> : null}
        </div>
        <nav className="-mx-1 mt-2 overflow-x-auto px-1 pb-0.5 text-xs font-medium text-muted-foreground sm:mx-0 sm:mt-2.5 sm:px-0 sm:pb-0 sm:text-[13px]">
          <div className="flex w-max min-w-full flex-nowrap items-center gap-1 sm:min-w-0">
            <Link
              href="/notebook"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 whitespace-nowrap sm:h-9 sm:px-3",
              )}
            >
              Timeline
            </Link>
            <Link
              href="/journal"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 whitespace-nowrap sm:h-9 sm:px-3",
              )}
            >
              Journal
            </Link>
            <Link
              href="/trades"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 whitespace-nowrap sm:h-9 sm:px-3",
              )}
            >
              Trades
            </Link>
            <Link
              href="/backtests"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 whitespace-nowrap sm:h-9 sm:px-3",
              )}
            >
              Backtests
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 whitespace-nowrap sm:h-9 sm:px-3",
              )}
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </div>
      <DailyPerspectiveBar />
    </header>
  );
}
