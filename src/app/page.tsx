import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/notebook");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Phase 2
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Trading &amp; Life Journal
          </h1>
          <p className="text-muted-foreground">
            A private notebook for daily notes, market observations, and
            trading context—starting with a signed-in journal.
          </p>
        </div>
        <ModeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sign in to begin</CardTitle>
          <CardDescription>
            Google OAuth keeps the app personal. Your entries stay tied to your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Continue to sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://authjs.dev" target="_blank" rel="noreferrer">
              Auth.js docs
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
