"use client";

import { useEffect, useRef, useState } from "react";
import { experience } from "./state";

const HOLD_SECONDS = 2.5;

export default function HoldToMerge() {
  const button = useRef<HTMLButtonElement>(null);
  const holding = useRef(false);
  const [merged, setMerged] = useState(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (holding.current) experience.merge = reduce ? 1 : Math.min(1, experience.merge + dt / HOLD_SECONDS);
      else if (experience.merge < 1) experience.merge = Math.max(0, experience.merge - dt / 1.2); // let go early: strands drift back
      button.current?.style.setProperty("--p", String(experience.merge));
      if (experience.merge >= 1) return setMerged(true); // locked; scrolling past also sets merge = 1
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const start = () => {
    holding.current = true;
  };
  const stop = () => {
    holding.current = false;
  };
  const isHoldKey = (key: string) => key === " " || key === "Enter";

  return (
    <div aria-live="polite" className="grid place-items-center">
      {merged ? (
        <h2 className="fade-in text-center font-serif text-4xl leading-tight md:text-6xl">
          Technology with intelligence.
          <br />
          <em className="text-fused">Experiences with feeling.</em>
        </h2>
      ) : (
        <button
          ref={button}
          type="button"
          className="hold-ring"
          onPointerDown={start}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (!isHoldKey(e.key)) return;
            e.preventDefault();
            start();
          }}
          onKeyUp={(e) => {
            if (isHoldKey(e.key)) stop();
          }}
        >
          Press &amp; hold
          <span className="sr-only"> to merge the two strands</span>
        </button>
      )}
    </div>
  );
}
