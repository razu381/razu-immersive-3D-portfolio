"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { CSSProperties } from "react";

const LabStage = dynamic(() => import("./LabStage"), { ssr: false });

// Lines draw on in reading order; --i staggers them.
const at = (i: number) => ({ "--i": i }) as CSSProperties;
const label = "font-plexmono text-[10px] uppercase tracking-[0.1em] text-ink-2";

// PLACEHOLDER fields: they fill in as the run plays (hero only for now, so they wait empty).
const FIELDS = ["Patient", "Date of birth", "Referrer", "Routed to"];
const TABS = ["Read", "Check", "Route", "Draft", "Sign-off"];

function CropMarks() {
  const mark = "absolute size-3 border-ink";
  return (
    <>
      <span className={`${mark} -top-2 -left-2 border-t border-l`} />
      <span className={`${mark} -top-2 -right-2 border-t border-r`} />
      <span className={`${mark} -bottom-2 -left-2 border-b border-l`} />
      <span className={`${mark} -right-2 -bottom-2 border-r border-b`} />
    </>
  );
}

// The engineering-drawing title block is the identity: it replaces a logo.
function TitleBlock() {
  const cell = "flex flex-col gap-1 border-rule p-3";
  return (
    <div className="ink-in grid grid-cols-[1fr_auto] border border-rule font-plexmono text-[11px]" style={at(9)}>
      <div className={`${cell} row-span-2 border-r border-b`}>
        <span className={label}>Drawn by</span>
        <span className="font-plex text-lg leading-tight font-medium text-ink">Your Name</span>
        <span className="text-ink-2">AI Engineer &amp; Creative Developer</span>
      </div>
      <div className={`${cell} border-b`}>
        <span className={label}>Date</span>
        <span>2026</span>
      </div>
      <div className={`${cell} border-b`}>
        <span className={label}>Rev.</span>
        <span>B</span>
      </div>
      <div className={`${cell} border-r`}>
        <span className={label}>Title</span>
        <span>Working order · AI automation &amp; full stack</span>
      </div>
      <div className={cell}>
        <span className={label}>Scale</span>
        <span>1:1</span>
      </div>
    </div>
  );
}

export default function LabHero() {
  return (
    <main className="paper relative flex h-svh min-h-[42rem] flex-col overflow-hidden px-6 pb-6 font-plex md:pr-16 md:pl-10">
      {/* Header block: what this document is. */}
      <header className="condensed grid grid-cols-3 items-baseline py-4 text-[12px]">
        <span className="ink-in" style={at(1)}>
          Work order · WO-0142
        </span>
        <span className="ink-in text-center text-ink-2" style={at(2)}>
          Intake
        </span>
        <span className="ink-in flex justify-end gap-6" style={at(3)}>
          <span className="text-ink-2">Sheet 1 of 3</span>
          <Link href="/#work" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
            Skip to work
          </Link>
        </span>
      </header>
      <div className="draw-x h-px bg-rule" style={at(0)} />

      {/* Display line and a margin note. */}
      <section className="grid grid-cols-12 gap-6 py-6">
        <div className="col-span-12 flex flex-col gap-3 md:col-span-8">
          <span className={`ink-in ${label}`} style={at(4)}>
            00 · Purpose
          </span>
          <h1
            className="ink-in text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.03em]"
            style={at(5)}
          >
            Real AI workflows, made visible.
          </h1>
        </div>
        <aside className="relative col-span-4 hidden flex-col justify-end gap-2 pl-5 font-plexmono text-[11px] leading-relaxed text-ink-2 md:flex">
          <span className="draw-y absolute top-0 bottom-0 left-0 w-px bg-rule" style={at(4)} />
          <span className={`ink-in ${label}`} style={at(6)}>
            Note 1
          </span>
          <p className="ink-in" style={at(7)}>
            2020: hospital by day, first client site by night. I&apos;ve been automating that kind of work since.
          </p>
          <p className="ink-in text-ink" style={at(8)}>
            From incoming work to working result.
          </p>
        </aside>
      </section>

      {/* Fig. 1: the 3D stage is a plate in the document. */}
      <figure className="relative flex min-h-0 flex-1 flex-col gap-2">
        <div className="relative min-h-0 flex-1">
          <CropMarks />
          <div className="develop absolute inset-0 bg-studio">
            <LabStage />
          </div>
          <span className="draw-x absolute inset-x-0 top-0 h-px bg-rule" style={at(3)} />
          <span className="draw-x absolute inset-x-0 bottom-0 h-px bg-rule" style={at(5)} />
          <span className="draw-y absolute inset-y-0 left-0 w-px bg-rule" style={at(4)} />
          <span className="draw-y absolute inset-y-0 right-0 w-px bg-rule" style={at(6)} />
        </div>
        <figcaption className="ink-in flex justify-between font-plexmono text-[11px] text-ink-2" style={at(8)}>
          <span>Fig. 1, Intake line, three-quarter view</span>
          <span>Made-up data · replay of the pipeline</span>
        </figcaption>
      </figure>

      {/* Numbered fields waiting to be filled, and the title block. */}
      <div className="grid grid-cols-12 gap-6 pt-5">
        <div className="col-span-12 grid grid-cols-2 border-t border-l border-rule md:col-span-8 md:grid-cols-4">
          {FIELDS.map((name, i) => (
            <div key={name} className="ink-in flex flex-col gap-2 border-r border-b border-rule p-3" style={at(7 + i)}>
              <span className={label}>
                {String(i + 1).padStart(2, "0")} · {name}
              </span>
              <span className="h-6 border-b border-dashed border-rule bg-paper-2/60" />
            </div>
          ))}
        </div>
        <div className="col-span-12 md:col-span-4">
          <TitleBlock />
        </div>
      </div>

      {/* Sheet tabs: index-card tabs on the right edge mark progress through the run. */}
      <nav aria-label="Sheets" className="absolute top-1/2 right-0 hidden -translate-y-1/2 flex-col gap-1 md:flex">
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className="ink-in condensed border border-r-0 border-rule bg-paper-2 px-1.5 py-3 text-[10px] text-ink-2 [writing-mode:vertical-rl]"
            style={at(10 + i)}
          >
            {String(i + 1).padStart(2, "0")} {tab}
          </span>
        ))}
      </nav>
    </main>
  );
}
