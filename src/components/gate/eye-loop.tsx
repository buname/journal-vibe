"use client";

import { useEffect, useRef } from "react";

const SRC = "/gate/abe-21st.mp4";
const POSTER = "/gate/eye.png";

export function EyeLoop() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const layers = [a, b];
    for (const el of layers) {
      el.muted = true;
      el.playsInline = true;
      el.loop = false;
    }

    let active = 0;
    let armed = false;
    let raf = 0;

    const crossFor = (duration: number) =>
      Math.min(0.55, Math.max(0.22, duration * 0.2));

    const start = (el: HTMLVideoElement) => {
      el.currentTime = 0;
      void el.play().catch(() => {});
    };

    const tick = () => {
      const cur = layers[active];
      const nxt = layers[1 - active];
      const duration = cur.duration;
      if (duration && Number.isFinite(duration) && duration > 0.4) {
        const remain = duration - cur.currentTime;
        const fade = crossFor(duration);
        if (remain <= fade) {
          if (!armed) {
            armed = true;
            start(nxt);
          }
          const t = Math.max(0, Math.min(1, 1 - remain / fade));
          cur.style.opacity = String(1 - t);
          nxt.style.opacity = String(t);
          if (remain <= 0.04 || cur.ended) {
            cur.pause();
            cur.currentTime = 0;
            cur.style.opacity = "0";
            nxt.style.opacity = "1";
            active = 1 - active;
            armed = false;
          }
        } else {
          cur.style.opacity = "1";
          nxt.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onReady = () => start(a);
    a.addEventListener("loadeddata", onReady);
    if (a.readyState >= 2) onReady();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("loadeddata", onReady);
    };
  }, []);

  return (
    <aside className="asterisk-art" aria-label="Eye">
      <img className="asterisk-abe asterisk-abe-still" src={POSTER} alt="" />
      <video
        ref={aRef}
        className="asterisk-abe"
        src={SRC}
        poster={POSTER}
        muted
        playsInline
        preload="auto"
      />
      <video
        ref={bRef}
        className="asterisk-abe"
        src={SRC}
        muted
        playsInline
        preload="auto"
        style={{ opacity: 0 }}
      />
    </aside>
  );
}
