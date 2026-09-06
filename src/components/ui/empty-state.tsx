import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  description: string;
  icons?: LucideIcon[];
  title: string;
}

export function EmptyState({
  action,
  className,
  description,
  icons = [],
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "group w-full max-w-[620px] rounded-xl border-2 border-dashed border-border bg-background p-14 text-center transition duration-500 hover:border-border/80 hover:bg-muted/50 hover:duration-200",
        className,
      )}
    >
      <div className="isolate flex justify-center">
        {icons.length === 3 ? (
          <>
            <div className="relative left-2.5 top-1.5 grid size-12 -rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-x-5 group-hover:-translate-y-0.5 group-hover:-rotate-12 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "size-6 text-muted-foreground",
              })}
            </div>
            <div className="relative z-10 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "size-6 text-muted-foreground",
              })}
            </div>
            <div className="relative right-2.5 top-1.5 grid size-12 rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:translate-x-5 group-hover:-translate-y-0.5 group-hover:rotate-12 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "size-6 text-muted-foreground",
              })}
            </div>
          </>
        ) : (
          <div className="grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
            {icons[0] &&
              React.createElement(icons[0], {
                className: "size-6 text-muted-foreground",
              })}
          </div>
        )}
      </div>
      <h2 className="mt-6 font-medium text-foreground">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
        {description}
      </p>
      {action ? (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="mt-4 shadow-sm active:shadow-none"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
