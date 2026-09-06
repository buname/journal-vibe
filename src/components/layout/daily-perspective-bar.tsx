"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function DailyPerspectiveBar() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || prefersReducedMotion) {
    return (
      <div className="journal-perspective" aria-label="Trading mantra">
        <p className="journal-perspective-inner">
          <span className="journal-perspective-base">Base Hits</span>
          <span className="journal-perspective-chevron" aria-hidden="true">
            &gt;
          </span>
          <span className="journal-perspective-home">
            <span className="journal-perspective-shine">Home Runs</span>
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="journal-perspective" aria-label="Trading mantra">
      <p className="journal-perspective-inner">
        <motion.span
          className="journal-perspective-base"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Base Hits
        </motion.span>
        <span className="journal-perspective-chevron" aria-hidden="true">
          &gt;
        </span>
        <motion.span
          className="journal-perspective-home"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="journal-perspective-shine">Home Runs</span>
        </motion.span>
      </p>
    </div>
  );
}
