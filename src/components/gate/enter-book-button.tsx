"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/google-sign-in";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnterBookButton({
  signedIn,
  className,
  label,
}: {
  signedIn: boolean;
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (signedIn) {
    return (
      <Button asChild className={className}>
        <Link href="/notebook">{label ?? "Open the book"}</Link>
      </Button>
    );
  }

  const handleEnter = () => {
    setLoading(true);
    void signInWithGoogle("/notebook").catch(() => {
      setLoading(false);
    });
  };

  return (
    <Button
      type="button"
      className={cn(className)}
      disabled={loading}
      onClick={handleEnter}
    >
      {loading ? "Opening…" : (label ?? "Sign in with Google")}
    </Button>
  );
}
