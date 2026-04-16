"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/notebook";

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Continue with Google to access your private journal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Continue with Google
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to the provider&apos;s terms for your Google
          account.
        </p>
      </CardContent>
    </Card>
  );
}
