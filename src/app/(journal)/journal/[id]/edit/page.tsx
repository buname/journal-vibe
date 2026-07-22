import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { JournalForm } from "@/components/editor/journal-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type JournalEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JournalEditPage({ params }: JournalEditPageProps) {
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
        <Button variant="outline" size="sm" asChild>
          <Link href={`/journal/${entry.id}`}>Cancel</Link>
        </Button>
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
          images: entry.images,
        }}
      />
    </div>
  );
}
