"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type AppProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function AppProviders({ children, session }: AppProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
