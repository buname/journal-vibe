import { JournalHeader } from "@/components/layout/journal-header";

export default function JournalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <JournalHeader />
      <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
