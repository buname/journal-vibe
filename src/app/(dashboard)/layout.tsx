import { JournalDockNav } from "@/components/layout/journal-dock-nav";
import { JournalHeader } from "@/components/layout/journal-header";
import "@/components/layout/journal-chrome.css";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="journal-shell">
      <JournalHeader />
      <div className="journal-body journal-body-dock journal-body-wide">{children}</div>
      <JournalDockNav />
    </div>
  );
}
