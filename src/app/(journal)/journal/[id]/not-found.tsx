import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function JournalEntryNotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Entry not found</h1>
      <p className="text-sm text-muted-foreground">
        This journal entry does not exist or belongs to another account.
      </p>
      <Button asChild>
        <Link href="/journal">Back to journal</Link>
      </Button>
    </div>
  );
}
