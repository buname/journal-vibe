"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface DockItem {
  className?: string;
  href?: string;
  icon: LucideIcon;
  isActive?: boolean;
  label: string;
  onClick?: () => void;
}

interface DockProps {
  className?: string;
  items: DockItem[];
}

interface DockIconButtonProps extends DockItem {}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ className, href, icon: Icon, isActive, label, onClick }, ref) => {
    const content = (
      <>
        <Icon
          className={cn(
            "size-5 transition-colors",
            isActive ? "text-primary" : "text-foreground",
          )}
          strokeWidth={isActive ? 2.25 : 1.75}
        />
        <span
          className={cn(
            "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100",
          )}
        >
          {label}
        </span>
      </>
    );

    const sharedClassName = cn(
      "group relative rounded-xl p-3 transition-colors",
      isActive
        ? "bg-primary/12 ring-1 ring-primary/25"
        : "hover:bg-secondary",
      className,
    );

    if (href) {
      return (
        <Link
          aria-current={isActive ? "page" : undefined}
          aria-label={label}
          className={cn(
            sharedClassName,
            "inline-flex transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none",
          )}
          href={href}
          onClick={onClick}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        aria-label={label}
        aria-pressed={isActive}
        className={cn(
          sharedClassName,
          "transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none",
        )}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  },
);
DockIconButton.displayName = "DockIconButton";

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, items }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const shellClassName = cn(
      "flex items-center gap-1 rounded-2xl border border-border bg-background/90 p-2 shadow-lg backdrop-blur-lg transition-shadow duration-300 hover:shadow-xl",
    );

    const dockItems = items.map((item) => (
      <DockIconButton key={item.label} {...item} />
    ));

    return (
      <div
        ref={ref}
        className={cn("flex w-full items-center justify-center", className)}
      >
        {mounted && !prefersReducedMotion ? (
          <motion.div
            animate="animate"
            className={shellClassName}
            initial="initial"
            variants={floatingAnimation}
          >
            {dockItems}
          </motion.div>
        ) : (
          <div className={shellClassName}>{dockItems}</div>
        )}
      </div>
    );
  },
);
Dock.displayName = "Dock";

export { Dock };
