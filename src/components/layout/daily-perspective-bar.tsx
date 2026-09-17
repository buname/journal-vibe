"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function DailyPerspectiveBar() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animate = mounted && !prefersReducedMotion;

  return (
    <div className="journal-perspective" aria-label="Trading mantra">
      <p className="journal-perspective-inner">
        <motion.span
          className="journal-perspective-base"
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Base Hits
        </motion.span>

        <motion.span
          className="journal-perspective-chevron"
          aria-hidden="true"
          initial={animate ? { opacity: 0, scale: 0.7 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          &gt;
        </motion.span>

        <motion.span
          className="journal-perspective-home"
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="journal-perspective-shine">Home Runs</span>
        </motion.span>
      </p>
    </div>
  );
}
