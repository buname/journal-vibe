import { Suspense } from "react";

import { JournalHeader } from "@/components/layout/journal-header";
import { SaveToast } from "@/components/layout/save-toast";

export default function JournalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <Suspense>
        <SaveToast />
      </Suspense>
      <JournalHeader />
      <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
