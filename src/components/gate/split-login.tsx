"use client";

import { EyeLoop } from "@/components/gate/eye-loop";
import { Component as SignInCard2 } from "@/components/ui/sign-in-card-2";

export function SplitLogin({
  signedIn = false,
  callbackUrl = "/notebook",
}: {
  signedIn?: boolean;
  callbackUrl?: string;
}) {
  return (
    <div className="asterisk">
      <div className="asterisk-copy">
        <SignInCard2 signedIn={signedIn} callbackUrl={callbackUrl} embedded />
      </div>
      <EyeLoop />
    </div>
  );
}
