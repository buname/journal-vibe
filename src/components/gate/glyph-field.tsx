"use client";

import { useEffect, useRef } from "react";

export type FieldView =
  | "timeline"
  | "journal"
  | "trades"
  | "backtests"
  | "dashboard";

type GlyphFieldProps = {
  view?: FieldView;
  tone?: "ink" | "light";
};

export function GlyphField({ tone = "ink" }: GlyphFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef(tone);
  toneRef.current = tone;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;

    let cols = 48;
    let rows = 80;
    let n = cols * rows;
    let target = new Float32Array(n);
    let w = 1;
    let h = 1;

    const pointer = { x: -1, y: -1, on: false };
    let raf = 0;
    const start = performance.now();

    const tape = (col: number, row: number) => {
      let s =
        Math.imul(col + 1, 374761393) ^ Math.imul(row | 0, 668265263);
      s = Math.imul(s ^ (s >>> 13), 1274126177);
      return (s >>> 0) & 1;
    };

    const paintPhi = () => {
      off.width = cols;
      off.height = rows;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, cols, rows);
      octx.fillStyle = "#000";
      octx.strokeStyle = "#000";
      octx.lineCap = "round";
      octx.lineJoin = "round";

      const cx = cols * 0.5;
      const cy = rows * 0.5;
      const R = Math.min(cols, rows) * 0.34;
      // φ = an oval ring (not a filled disk) crossed by a vertical stem.
      const rx = R * 0.72;
      const ry = R;
      const weight = Math.max(2.6, R * 0.26);

      // Bowl: a stroked ellipse, so the centre stays open like a real phi.
      octx.lineWidth = weight;
      octx.beginPath();
      octx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      octx.stroke();

      // Stem: a vertical bar through the bowl, extending above and below it.
      octx.fillRect(cx - weight / 2, cy - ry * 1.62, weight, ry * 3.24);

      const pix = octx.getImageData(0, 0, cols, rows).data;
      for (let i = 0; i < n; i++) {
        target[i] = pix[i * 4 + 3] / 255;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(box.width));
      h = Math.max(1, Math.floor(box.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cell = Math.max(7, Math.min(10, Math.min(w, h) / 72));
      const nextCols = Math.max(28, Math.floor(w / cell));
      const nextRows = Math.max(36, Math.floor(h / cell));
      if (nextCols !== cols || nextRows !== rows) {
        cols = nextCols;
        rows = nextRows;
        n = cols * rows;
        target = new Float32Array(n);
      }
      paintPhi();
    };

    const draw = (now: number) => {
      if (w < 2 || h < 2) return;
      const cw = w / cols;
      const ch = h / rows;
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${Math.max(7, Math.min(cw, ch) * 0.92)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const rgb =
        toneRef.current === "light" ? "236, 232, 224" : "90, 102, 186";

      // φ stays fixed and centred; each cell keeps its place and only its
      // digit flips over time. Hovering erases the cells under the pointer.
      const rate = reduced ? 0.3 : 1.15;
      const holeR = Math.max(34, Math.min(w, h) * 0.09);
      const hole2 = holeR * holeR;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let v = target[y * cols + x];
          if (v < 0.05) continue;

          if (pointer.on) {
            const dx = (x + 0.5) * cw - pointer.x;
            const dy = (y + 0.5) * ch - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < hole2) continue; // hovered cells vanish
            if (d2 < hole2 * 2.4) v *= (d2 - hole2) / (hole2 * 1.4);
          }

          const a = Math.min(0.92, v);
          if (a < 0.05) continue;

          const seed =
            (Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263)) >>> 0;
          const phase = (seed % 617) / 617;
          const jitter = 0.55 + ((seed >>> 5) % 100) / 100;
          const step = Math.floor(t * rate * jitter + phase * 8);
          const bit = (step ^ seed ^ tape(x, y)) & 1;

          ctx.fillStyle = `rgba(${rgb}, ${a})`;
          ctx.fillText(bit ? "1" : "0", (x + 0.5) * cw, (y + 0.52) * ch);
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    resize();
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      pointer.x = e.clientX - b.left;
      pointer.y = e.clientY - b.top;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="glyph-field">
      <canvas
        ref={canvasRef}
        className="glyph-field-canvas"
        role="img"
        aria-label="Phi drawn as a field of numbers flowing down"
      />
    </div>
  );
}
