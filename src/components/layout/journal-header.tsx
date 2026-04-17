import Link from "next/link";

import { auth } from "@/auth";
import { DailyPerspectiveBar } from "@/components/layout/daily-perspective-bar";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/notebook", label: "Timeline" },
  { href: "/journal", label: "Journal" },
  { href: "/trades", label: "Trades" },
  { href: "/backtests", label: "Backtests" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

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
            Journal
          </Link>
          {session?.user ? <UserMenu user={session.user} /> : null}
        </div>
        <nav className="mt-2 sm:mt-2.5">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full flex-nowrap items-center gap-1 sm:min-w-0">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 shrink-0 rounded-full border border-border/70 px-3 text-xs whitespace-nowrap sm:h-9 sm:rounded-md sm:border-transparent sm:px-3 sm:text-[13px]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
      <DailyPerspectiveBar />
    </header>
  );
}
