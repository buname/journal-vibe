"use client";

import { useEffect, useRef, useState } from "react";

const FILLS = [
  {
    id: "mnq",
    symbol: "MNQ",
    side: "Long",
    pnl: "+$279.20",
    r: "+4.50R",
    entry: "29497.00",
    exit: "29567.75",
    dur: "26m",
    qty: "2",
    note: "specimen · 27 Aug",
  },
  {
    id: "mes",
    symbol: "MES",
    side: "Short",
    pnl: "+$84.50",
    r: "+1.80R",
    entry: "5122.25",
    exit: "5114.00",
    dur: "11m",
    qty: "4",
    note: "specimen",
  },
  {
    id: "mym",
    symbol: "MYM",
    side: "Long",
    pnl: "−$32.00",
    r: "−0.40R",
    entry: "41210",
    exit: "41186",
    dur: "7m",
    qty: "1",
    note: "specimen",
  },
] as const;

function scramble(target: string, t: number) {
  return [...target]
    .map((ch, i) => {
      if (ch === "." || ch === "," || ch === "$" || ch === "+" || ch === "−" || ch === "R")
        return ch;
      if (t >= 1 || i / Math.max(target.length, 1) < t) return ch;
      return String((Math.random() * 10) | 0);
    })
    .join("");
}

function Tick({
  value,
  play,
  delay = 0,
  className,
}: {
  value: string;
  play: boolean;
  delay?: number;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!play || reduced.current) {
      setText(value);
      return;
    }
    setText(scramble(value, 0));
    let tick = 0;
    const start = window.setTimeout(() => {
      let n = 0;
      tick = window.setInterval(() => {
        n += 1;
        const t = Math.min(1, n / 22);
        setText(t >= 1 ? value : scramble(value, t));
        if (t >= 1) window.clearInterval(tick);
      }, 38);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
    };
  }, [play, value, delay]);

  return (
    <span className={className} aria-label={value}>
      {text}
    </span>
  );
}

export function KeepFills() {
  const root = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lead = FILLS[0];
  const rest = FILLS.slice(1);

  return (
    <section ref={root} className="keep" aria-label="Kept fills">
      <div className="keep-intro">
        <h2>Every trade, kept like this.</h2>
        <p>
          The fill, the R, the duration — computed from the numbers. Specimen
          rows, not a live tape.
        </p>
      </div>

      <article className={`keep-lead${play ? " is-in" : ""}`}>
        <header className="keep-lead-top">
          <div>
            <span className="keep-sym">{lead.symbol}</span>
            <span className="keep-side">{lead.side}</span>
          </div>
          <div className="keep-pnl">
            <Tick value={lead.pnl} play={play} delay={120} className="keep-pnl-n" />
            <small>{lead.note}</small>
          </div>
        </header>

        <svg
          className="keep-path"
          viewBox="0 0 300 88"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            className="keep-area"
            d="M6 74 C 44 71, 60 54, 86 57 S 140 40, 172 44 S 236 27, 294 15 L294 88 L6 88 Z"
          />
          <path
            className="keep-stroke"
            d="M6 74 C 44 71, 60 54, 86 57 S 140 40, 172 44 S 236 27, 294 15"
          />
        </svg>

        <dl className="keep-stats">
          <div>
            <dt>Entry</dt>
            <dd>
              <Tick value={lead.entry} play={play} delay={220} />
            </dd>
          </div>
          <div>
            <dt>Exit</dt>
            <dd>
              <Tick value={lead.exit} play={play} delay={320} />
            </dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{lead.dur}</dd>
          </div>
          <div>
            <dt>Qty</dt>
            <dd>{lead.qty}</dd>
          </div>
          <div className="keep-r">
            <dt>R</dt>
            <dd>
              <Tick value={lead.r} play={play} delay={420} />
            </dd>
          </div>
        </dl>
      </article>

      <ul className="keep-tape">
        {rest.map((row, i) => (
          <li key={row.id} className={play ? "is-in" : undefined}>
            <span className="keep-sym">{row.symbol}</span>
            <span className="keep-side">{row.side}</span>
            <Tick
              value={row.pnl}
              play={play}
              delay={500 + i * 140}
              className="keep-tape-pnl"
            />
            <Tick value={row.r} play={play} delay={560 + i * 140} />
            <span className="keep-tape-meta">
              {row.qty} @ {row.dur}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
