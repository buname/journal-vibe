"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ChoiceChipGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function ChoiceChipGroup({ children, className }: ChoiceChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  );
}

type ChoiceChipProps = {
  active: boolean;
  activeClassName?: string;
  children: React.ReactNode;
  className?: string;
  layoutId: string;
  onClick: () => void;
};

export function ChoiceChip({
  active,
  activeClassName = "bg-primary",
  children,
  className,
  layoutId,
  onClick,
}: ChoiceChipProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 px-3 py-2.5 text-sm font-semibold",
        "text-muted-foreground transition-[color,transform] duration-200 hover:scale-[1.02] hover:text-foreground active:scale-[0.96] motion-reduce:transform-none",
        active && "border-transparent text-primary-foreground",
        className,
      )}
    >
      {active ? (
        mounted && !reduceMotion ? (
          <motion.span
            layoutId={layoutId}
            className={cn("absolute inset-0 rounded-xl shadow-sm", activeClassName)}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        ) : (
          <span
            className={cn("absolute inset-0 rounded-xl shadow-sm", activeClassName)}
          />
        )
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
