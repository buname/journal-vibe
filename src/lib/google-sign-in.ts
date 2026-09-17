"use client";

import { signIn, signOut } from "next-auth/react";

/** Always show Google's account picker — not just the last-used account. */
const GOOGLE_ACCOUNT_PICKER = {
  prompt: "select_account",
} as const;

export function signInWithGoogle(callbackUrl = "/notebook") {
  return signIn("google", { callbackUrl }, GOOGLE_ACCOUNT_PICKER);
}

export async function switchGoogleAccount(callbackUrl = "/notebook") {
  await signOut({ redirect: false });
  return signInWithGoogle(callbackUrl);
}
