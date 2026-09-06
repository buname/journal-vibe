"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/notebook", label: "Timeline" },
  { href: "/journal", label: "Journal" },
  { href: "/trades", label: "Trades" },
  { href: "/backtests", label: "Backtests" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function JournalNav() {
  const pathname = usePathname();

  return (
    <nav className="journal-nav" aria-label="Book">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="journal-nav-link"
            data-active={active ? "true" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
