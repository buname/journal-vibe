"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type CardAccent = "win" | "loss" | "neutral";

interface InteractiveProductCardProps {
  accent?: CardAccent;
  badge?: React.ReactNode;
  chart?: React.ReactNode;
  className?: string;
  description: string;
  footer?: React.ReactNode;
  imageUrl?: string;
  price: string;
  size?: "default" | "large";
  title: string;
}

const accentGradients: Record<CardAccent, string> = {
  win: "from-emerald-950 via-emerald-800/70 to-slate-900",
  loss: "from-rose-950 via-rose-900/70 to-slate-900",
  neutral: "from-slate-900 via-primary/35 to-slate-950",
};

export function InteractiveProductCard({
  accent = "neutral",
  badge,
  chart,
  className,
  description,
  footer,
  imageUrl,
  price,
  size = "default",
  title,
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || reduceMotion) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = ((y - height / 2) / (height / 2)) * -10;
    const rotateY = ((x - width / 2) / (width / 2)) * 10;

    setStyle({
      transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.12s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
    });
  };

  const isLarge = size === "large";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full rounded-[1.75rem] bg-card shadow-2xl shadow-black/25 [transform-style:preserve-3d]",
        isLarge
          ? "aspect-[3/4] max-w-[420px]"
          : "aspect-[9/12] max-w-[340px]",
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full rounded-[1.75rem] object-cover"
          style={{ transform: "translateZ(-24px) scale(1.1)" }}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 rounded-[1.75rem] bg-gradient-to-br",
            accentGradients[accent],
          )}
          style={{ transform: "translateZ(-24px)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.14),transparent_48%)]" />
          <motion.div
            aria-hidden
            className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [0, 12, 0],
                    y: [0, -8, 0],
                  }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-t from-black/80 via-black/35 to-black/15" />

      <div
        className="absolute inset-0 flex flex-col p-5 sm:p-6"
        style={{ transform: "translateZ(48px)" }}
      >
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-md">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {title}
            </h3>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">{description}</p>
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>

        <div
          className={cn(
            "relative mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black/30 backdrop-blur-md",
            isLarge ? "min-h-[200px] flex-1" : "h-[148px]",
          )}
        >
          <motion.div
            key={price}
            className="absolute left-3 top-3 z-10"
            initial={reduceMotion ? false : { scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <div
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold tabular-nums text-white shadow-lg backdrop-blur-sm sm:text-base",
                accent === "win" && "bg-emerald-500/40 shadow-emerald-500/20",
                accent === "loss" && "bg-rose-500/40 shadow-rose-500/20",
                accent === "neutral" && "bg-black/45",
              )}
            >
              {price}
            </div>
          </motion.div>

          {chart ?? (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              Chart
            </div>
          )}
          {imageUrl ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          ) : null}
        </div>

        {footer ? (
          <div className="mt-4 space-y-3">{footer}</div>
        ) : (
          <div className="mt-auto flex w-full justify-center gap-2 pb-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  index === 0 ? "bg-white" : "bg-white/30",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
