"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

const DIRECTIONS = [
  { href: "/type", name: "Living Type" },
  { href: "/optics", name: "Optical Bench" },
  { href: "/paper", name: "Paper & Ink" },
];

// Shared overlay for the three hero sketches: identity, the promise, and a way to compare and replay.
export default function HeroFrame({
  index,
  note,
  children,
}: {
  index: number;
  note: string;
  children: (replay: number) => ReactNode;
}) {
  const [replay, setReplay] = useState(0);
  return (
    <main className="relative h-svh overflow-hidden bg-bg">
      <div className="absolute inset-0">{children(replay)}</div>

      <header className="absolute inset-x-0 top-0 flex items-baseline justify-between gap-6 p-5 font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:p-8">
        <span>
          <span className="text-fg">Your Name</span>
          <span className="hidden md:inline"> · AI Engineer &amp; Creative Developer</span>
        </span>
        <nav aria-label="Directions" className="flex gap-5">
          {DIRECTIONS.map((d, i) => (
            <Link key={d.href} href={d.href} className={i === index ? "text-fg" : "hover:text-fg"}>
              {String(i + 1).padStart(2, "0")} {d.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="pointer-events-none absolute bottom-0 left-0 flex max-w-2xl flex-col gap-3 p-6 md:p-10">
        <p className="chapter-label fade-in">
          Direction {String(index + 1).padStart(2, "0")} · {DIRECTIONS[index].name}
        </p>
        <h1 className="fade-in font-serif text-5xl leading-[1.02] md:text-7xl">Real AI workflows, made visible.</h1>
        <p className="fade-in font-mono text-xs tracking-[0.15em] text-muted">From incoming work to working result.</p>
      </div>

      <div className="absolute right-0 bottom-0 flex max-w-xs flex-col items-end gap-3 p-6 text-right md:p-10">
        <p className="font-mono text-[11px] leading-relaxed text-muted">{note}</p>
        <button
          type="button"
          onClick={() => setReplay((r) => r + 1)}
          className="font-mono text-[11px] tracking-[0.2em] text-fused uppercase hover:underline"
        >
          Replay ↺
        </button>
      </div>
    </main>
  );
}
