import type { CSSProperties } from "react";

/** Drawn golden-ratio phi mark. */
export function PhiMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle
        className="phi-stroke phi-draw"
        cx="20"
        cy="21"
        r="9"
        strokeWidth="2.4"
        style={{ "--len": "60" } as CSSProperties}
      />
      <line
        className="phi-stroke phi-draw"
        x1="20"
        y1="4"
        x2="20"
        y2="38"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ "--len": "34" } as CSSProperties}
      />
    </svg>
  );
}
