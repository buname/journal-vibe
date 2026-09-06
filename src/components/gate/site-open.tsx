"use client";

import { useLayoutEffect, useState } from "react";

import { PhiMark } from "@/components/gate/phi-mark";
import "@/components/gate/site-open.css";

const KEY = "jv-opened";
const HOLD_MS = 2400;

/**
 * First-arrival opening: a golden frame draws, φ strokes in, then the
 * paper splits like a book. Once per tab session. Skipped under reduced motion.
 */
export function SiteOpen() {
  const [show, setShow] = useState(true);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(KEY)) {
        setShow(false);
        return;
      }
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode: still play once this mount */
    }
    document.documentElement.classList.add("is-opening");
    const play = window.setTimeout(() => {
      document.documentElement.classList.remove("is-opening");
    }, 1320);
    const hide = window.setTimeout(() => setShow(false), HOLD_MS);
    return () => {
      window.clearTimeout(play);
      window.clearTimeout(hide);
      document.documentElement.classList.remove("is-opening");
    };
  }, []);

  if (!show) return null;

  return (
    <div className="site-open" aria-hidden="true">
      <div className="site-open-leaf is-left" />
      <div className="site-open-leaf is-right" />
      <div className="site-open-core">
        <div className="site-open-frame">
          <svg className="site-open-geom" viewBox="0 0 1618 1000" fill="none">
            <rect
              className="geom-outer"
              x="12"
              y="12"
              width="1594"
              height="976"
              strokeWidth="8"
            />
            <line
              className="geom-square"
              x1="988"
              y1="12"
              x2="988"
              y2="988"
              strokeWidth="8"
            />
            <line
              className="geom-diag"
              x1="12"
              y1="12"
              x2="988"
              y2="988"
              strokeWidth="5"
            />
          </svg>
          <span className="site-open-phi">
            <PhiMark />
          </span>
          <span className="site-open-ticks" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
