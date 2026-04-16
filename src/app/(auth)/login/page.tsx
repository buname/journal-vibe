import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/notebook");
  }

  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Preparing sign-in…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
