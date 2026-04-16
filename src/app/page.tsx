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
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Trading &amp; Life Journal
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            A private notebook for daily notes, market observations, and
            trading context. Keep your process, ideas, and execution history in
            one focused place.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Journal", "Trades", "Backtests", "Dashboard"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <ModeToggle />
      </header>

      <Card className="border-border/70 bg-card/60 shadow-xl shadow-black/5 backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold">Sign in to begin</CardTitle>
          <CardDescription>
            Sign in with Google to access your private workspace. Your entries
            stay tied to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Keep your routine sharp every day.
            </p>
            <p className="text-xs text-muted-foreground">
              Track outcomes, review mistakes, and refine your edge.
            </p>
          </div>
          <Button size="lg" className="font-semibold shadow-md" asChild>
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
