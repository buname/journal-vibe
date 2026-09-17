"use client";

import { cn } from "@/lib/utils";
import type { ReactNode, RefObject } from "react";

type TimelineAnimationProps = {
  animationNum?: number;
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility. */
  timelineRef?: RefObject<HTMLElement | null>;
};

/** Pass-through wrapper — previous intersection opacity left dashboard blank. */
export function TimelineAnimation({
  children,
  className,
}: TimelineAnimationProps) {
  return <div className={cn(className)}>{children}</div>;
}
