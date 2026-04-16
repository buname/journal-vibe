import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { JournalDeleteButton } from "@/components/editor/journal-delete-button";
import { JournalForm } from "@/components/editor/journal-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type JournalEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const entry = await prisma.dailyJournal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Journal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Edit entry</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/journal">Back to list</Link>
          </Button>
          <JournalDeleteButton journalId={entry.id} />
        </div>
      </div>
      <JournalForm
        mode="edit"
        journal={{
          id: entry.id,
          title: entry.title,
          content: entry.content,
          date: entry.date,
          rating: entry.rating,
          tags: entry.tags,
        }}
      />
    </div>
  );
}
