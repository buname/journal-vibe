"use client";

import {
  FlaskConical,
  LayoutDashboard,
  LayoutList,
  LineChart,
  NotebookPen,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Dock, type DockItem } from "@/components/ui/dock-two";

const NAV_ITEMS = [
  { href: "/notebook", label: "Timeline", icon: LayoutList },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/trades", label: "Trades", icon: LineChart },
  { href: "/backtests", label: "Backtests", icon: FlaskConical },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function JournalDockNav() {
  const pathname = usePathname();

  const items: DockItem[] = NAV_ITEMS.map((item) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    return {
      href: item.href,
      label: item.label,
      icon: item.icon,
      isActive: active,
    };
  });

  return (
    <div className="journal-dock-wrap">
      <nav aria-label="Book" className="journal-dock">
        <Dock items={items} />
      </nav>
    </div>
  );
}
