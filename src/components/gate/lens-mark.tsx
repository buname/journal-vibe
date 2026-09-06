import type { CSSProperties } from "react";

/**
 * The Lens — the symbol from the iris: a vertical column of nested circles
 * whose overlaps read as a totem of stacked eyes. Replaces the old φ mark.
 * Deterministic geometry so it is server-safe (no hydration drift).
 */
const CX = 100;
const TOP = 48;
const BOT = 412;
const N = 9;
const MID = (N - 1) / 2;

const CIRCLES = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  return {
    i,
    cy: Math.round((TOP + t * (BOT - TOP)) * 100) / 100,
    r: Math.round((18 + Math.sin(t * Math.PI) * 48) * 100) / 100,
  };
});

export function LensMark({ className }: { className?: string }) {
  return (
    <svg
      className={`lens${className ? ` ${className}` : ""}`}
      viewBox="0 0 200 460"
      fill="none"
      role="img"
      aria-label="The Lens — a column of nested eyes"
    >
      <line className="lens-axis" x1={CX} y1={TOP - 14} x2={CX} y2={BOT + 14} />
      {CIRCLES.map((c) => (
        <circle
          key={c.i}
          className={`lens-ring${c.i === MID ? " is-core" : ""}`}
          cx={CX}
          cy={c.cy}
          r={c.r}
          pathLength={100}
          style={{ "--d": `${(c.i * 0.07).toFixed(2)}s` } as CSSProperties}
        />
      ))}
      <circle className="lens-pupil" cx={CX} cy={(TOP + BOT) / 2} r={6.5} />
    </svg>
  );
}
