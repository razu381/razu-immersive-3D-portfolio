"use client";

import { useEffect, useRef } from "react";
import { machine } from "@/components/machine/state";

const HOLD_SECONDS = 1.8;

// Press and hold to approve (mouse, touch, Space or Enter). Letting go early lets the key spring back.
export default function SignOffKey({ onApproved }: { onApproved: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const holding = useRef(false);
  const approved = useRef(onApproved);
  useEffect(() => {
    approved.current = onApproved;
  }, [onApproved]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const before = machine.hold;
      if (holding.current) machine.hold = reduce ? 1 : Math.min(1, machine.hold + dt / HOLD_SECONDS);
      else machine.hold = Math.max(0, machine.hold - dt / 0.6);
      button.current?.style.setProperty("--p", String(machine.hold));
      if (machine.hold !== before) machine.invalidate();
      if (machine.hold >= 1) return approved.current();
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
    <button
      ref={button}
      type="button"
      className="hold-ring hold-ring--human"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (!isHoldKey(e.key)) return;
        e.preventDefault();
        start();
      }}
      onKeyUp={(e) => isHoldKey(e.key) && stop()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="relative">Hold to approve</span>
    </button>
  );
}
