"use client";

import { EnterBookButton } from "@/components/gate/enter-book-button";
import { GateLanding } from "@/components/gate/gate-landing";
import { Hero } from "@/components/ui/hero";
import "@/components/gate/gate.css";

export function Gate({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="gate gate-hero">
      <Hero
        className="min-h-dvh rounded-none"
        title="Journal"
        subtitle="Private trading and life notebook. Log the fill, write the session, review the day."
        customActions={<EnterBookButton signedIn={signedIn} className="min-w-[8.5rem] rounded-lg" />}
        titleClassName="font-[family-name:var(--font-gate)] font-normal tracking-tight"
        subtitleClassName="max-w-xl text-base md:text-lg"
        actionsClassName="mt-4"
      />
      <GateLanding signedIn={signedIn} />
    </div>
  );
}
