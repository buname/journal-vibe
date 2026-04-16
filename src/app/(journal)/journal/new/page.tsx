import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { JournalForm } from "@/components/editor/journal-form";
import { Button } from "@/components/ui/button";

export default async function NewJournalPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Journal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">New entry</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/journal">Back to list</Link>
        </Button>
      </div>
      <JournalForm mode="create" />
    </div>
  );
}
