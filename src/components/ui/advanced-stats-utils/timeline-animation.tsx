"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type TimelineAnimationProps = {
  animationNum: number;
  children: ReactNode;
  className?: string;
  timelineRef: RefObject<HTMLElement | null>;
};

export function TimelineAnimation({
  animationNum,
  children,
  className,
  timelineRef,
}: TimelineAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
        }
      },
      {
        root: timelineRef.current,
        threshold: 0.15,
        rootMargin: "-24px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [timelineRef]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 28, filter: "blur(6px)" }
      }
      transition={{
        duration: 0.6,
        delay: animationNum * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
