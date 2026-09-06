"use client";

import { useSearchParams } from "next/navigation";

import { Component as SignInCard } from "@/components/ui/sign-in-card-2";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/notebook";

  return <SignInCard callbackUrl={callbackUrl} />;
}
