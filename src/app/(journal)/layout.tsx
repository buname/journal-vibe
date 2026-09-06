import { Suspense } from "react";

import { JournalDockNav } from "@/components/layout/journal-dock-nav";
import { JournalHeader } from "@/components/layout/journal-header";
import { SaveToast } from "@/components/layout/save-toast";
import "@/components/layout/journal-chrome.css";

export default function JournalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="journal-shell">
      <Suspense>
        <SaveToast />
      </Suspense>
      <JournalHeader />
      <div className="journal-body journal-body-dock journal-body-wide">{children}</div>
      <JournalDockNav />
    </div>
  );
}
