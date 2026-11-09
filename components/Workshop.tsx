"use client";

import Link from "next/link";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { workOrder, workOrders } from "@/content/work-orders";
import type { OrderId } from "@/lib/run/events";
import { stateAt, waitTime } from "@/lib/run/state";
import { approveRun, loadRun, machine, RUNS, type ShotName } from "@/components/machine/state";
import { experience } from "@/components/experience/state";
import Readout, { STATION_NOTES } from "@/components/readouts/Readout";
import RunBar from "@/components/readouts/RunBar";
import SignOffKey from "@/components/readouts/SignOffKey";

const CHAPTERS = ["Arrival", "Work order", "The run", "Sign-off", "Delivered", "Selected work", "Working together"];
const STEP_TITLES = ["Intake", "Read", "Check", "Route", "Draft", "Sign-off", "Delivered"];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// 0 → 1 while a tall section scrolls past its sticky content.
const through = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return clamp01(-r.top / (r.height - innerHeight));
};

export default function Workshop() {
  const arrival = useRef<HTMLElement>(null);
  const choose = useRef<HTMLElement>(null);
  const runSection = useRef<HTMLElement>(null);
  const signoff = useRef<HTMLElement>(null);
  const delivered = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const together = useRef<HTMLElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const [orderId, setOrderId] = useState<OrderId>("referral");
  const [t, setT] = useState(0);
  const [approved, setApproved] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [sound, setSound] = useState(false);
  const sections = [arrival, choose, runSection, signoff, delivered, work, together];

  const order = workOrder(orderId);
  const run = RUNS[orderId];
  const end = waitTime(run);
  const state = stateAt(run, t, approved);
  const final = stateAt(run, Infinity, approved);

  const scrollTo = (y: number) => (lenis.current ? lenis.current.scrollTo(y) : window.scrollTo({ top: y }));
  const seek = (time: number) => {
    const el = runSection.current!;
    scrollTo(el.offsetTop + (time / end) * (el.offsetHeight - innerHeight) + 2);
  };

  useEffect(() => {
    // Scroll is the playhead: scrubbing moves through the recorded run, stopping pauses it.
    const onScroll = () => {
      const vh = innerHeight;
      const active = Math.max(0, sections.findLastIndex((r) => r.current!.getBoundingClientRect().top <= vh * 0.5));
      const runEnd = waitTime(machine.run);
      const p = through(runSection.current!);
      machine.t = active < 2 ? 0 : active === 2 ? p * runEnd : runEnd;
      const signed: ShotName = machine.approved ? "delivery" : "signoff"; // after sign-off, watch the card land in the tray
      const shots: ShotName[] = ["establishing", "station", "station", signed, "rest", "rest", "rest"];
      machine.shot = shots[active];
      document.documentElement.dataset.scene = active >= 4 ? "dim" : ""; // the output is the hero
      if (active >= 4 && !experience.guideReady) {
        experience.guideReady = true; // the AI guide is offered once the visitor has seen a run through
        dispatchEvent(new Event("guide:ready"));
      }
      setT(Math.round(machine.t * 100) / 100);
      setChapter(active);
      machine.invalidate();
    };
    const onShow = () => scrollTo(work.current!.offsetTop);
    lenis.current = matchMedia("(prefers-reduced-motion: reduce)").matches ? null : new Lenis({ autoRaf: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    addEventListener("guide:show", onShow);
    onScroll();
    return () => {
      lenis.current?.destroy();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("guide:show", onShow);
      delete document.documentElement.dataset.scene;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sections and scrollTo only read refs; bind once
  }, []);

  const pick = (id: OrderId) => {
    loadRun(RUNS[id]);
    setOrderId(id);
    setApproved(false);
    scrollTo(runSection.current!.offsetTop);
  };
  const approve = useCallback(() => {
    approveRun();
    setApproved(true);
  }, []);

  const summary = [
    `${end.toFixed(1)}s`,
    `${new Set(final.fields.map((f) => f.key)).size} fields`,
    `${final.rules.length} checks`,
    `${final.checks.filter((c) => c.result === "flag").length} flags`,
    `${run.events.filter((e) => e.type === "retry").length} re-read`,
    "1 human approval",
  ];
  const station = Math.max(0, state.station);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 flex items-baseline justify-between gap-6 p-5 font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:p-8">
        <span className="text-fg">Your Name</span>
        <span className="hidden md:inline">AI Engineer &amp; Creative Developer</span>
        <span className="flex gap-6">
          <button
            type="button"
            className="uppercase hover:text-fg"
            onClick={async () => {
              const { setSound: play } = await import("@/lib/sound"); // Tone.js only loads if sound is wanted
              await play(!sound);
              setSound(!sound);
            }}
          >
            Sound {sound ? "on" : "off"}
          </button>
          <button type="button" className="uppercase hover:text-fg" onClick={() => scrollTo(work.current!.offsetTop)}>
            Skip to work ↓
          </button>
        </span>
      </header>

      <nav
        aria-label="Chapters"
        className="fixed top-1/2 left-5 z-10 hidden -translate-y-1/2 flex-col gap-3 font-mono text-[10px] tracking-[0.2em] md:left-8 md:flex"
      >
        {CHAPTERS.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => scrollTo(sections[i].current!.offsetTop)}
            className={`group flex items-center gap-3 uppercase ${i === chapter ? "text-fg" : "text-muted hover:text-fg"}`}
          >
            {String(i).padStart(2, "0")}
            <span className={i === chapter ? "" : "opacity-0 transition-opacity group-hover:opacity-100"}>{name}</span>
          </button>
        ))}
      </nav>

      <main>
        {/* 00 Arrival: the machine at rest, the promise in one line. */}
        <section ref={arrival} className="flex min-h-[170svh] flex-col px-6 md:px-24">
          <div className="flex h-svh flex-col justify-start gap-4 pt-[18vh]">
            <p className="chapter-label fade-in">00 — Working order</p>
            <h1 className="fade-in max-w-2xl font-serif text-5xl leading-[1.05] md:text-7xl">Real AI workflows, made visible.</h1>
            <p className="fade-in font-mono text-xs tracking-[0.15em] text-muted">From incoming work to working result.</p>
          </div>
          <p className="reveal max-w-md self-end pb-[20vh] font-serif text-2xl leading-snug text-fg/85">
            In 2020 I spent my days in a hospital and my nights building my first client website. I&apos;ve been
            automating the kind of work I saw there ever since.
          </p>
        </section>

        {/* 01 Choose a work order. */}
        <section ref={choose} className="flex min-h-svh flex-col justify-end gap-6 px-6 pb-[10vh] md:px-24">
          <p className="chapter-label reveal">01 — Choose a work order</p>
          <div className="reveal grid max-w-4xl gap-3 md:grid-cols-3">
            {workOrders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o.id)}
                className={`flex flex-col gap-2 rounded-[4px] border bg-surface/80 p-4 text-left backdrop-blur-sm transition-colors ${
                  o.id === orderId ? "border-machine/50" : "border-line hover:border-fg/30"
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  {o.number} {o.id === "referral" && "· featured"}
                </span>
                <span className="font-serif text-2xl">{o.title}</span>
                <span className="font-mono text-[11px] text-muted">{o.from}</span>
              </button>
            ))}
          </div>
          <p className="reveal font-mono text-[11px] text-muted">
            Made-up data · {run.source === "placeholder" ? "placeholder run" : "replay of a real run"} · admin automation
            only: it routes and drafts, it never diagnoses.
          </p>
        </section>

        {/* 02 The run: scroll scrubs through it; stop anywhere to inspect. */}
        <section ref={runSection} className="h-[720svh]">
          <div className="sticky top-0 flex h-svh flex-col justify-end gap-5 px-6 pb-6 md:px-24">
            <div className="flex flex-1 flex-col justify-between gap-6 pt-[14vh] md:flex-row md:items-start">
              <div className="flex max-w-sm flex-col gap-3">
                <p className="chapter-label">02 — The run · {String(station + 1).padStart(2, "0")} / 07</p>
                <h2 key={station} className="fade-in font-serif text-4xl md:text-5xl">
                  {STEP_TITLES[station]}
                </h2>
                <p className="text-sm text-fg/75">{STATION_NOTES[station]}</p>
              </div>
              <Readout state={state} order={order} t={t} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] text-muted">
                {order.number} · {order.title} · {run.source === "placeholder" ? "placeholder run" : "replay of a real run"} ·
                scroll to scrub, stop to inspect
              </p>
              <RunBar run={run} end={end} t={t} onSeek={seek} />
            </div>
          </div>
        </section>

        {/* 03 Sign-off: the climax. */}
        <section ref={signoff} className="h-[170svh]">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-between gap-8 px-6 pt-[14vh] pb-[8vh] text-center">
            <div className="flex flex-col items-center gap-4">
              <p className="chapter-label">03 — Sign-off</p>
              <h2 className="max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
                Nothing leaves without <em className="text-human">a human.</em>
              </h2>
            </div>
            {approved ? (
              <p className="fade-in font-mono text-xs tracking-[0.2em] text-fused uppercase">
                Signed off · {order.signer} · scroll on
              </p>
            ) : (
              <SignOffKey key={orderId} onApproved={approve} />
            )}
          </div>
        </section>

        {/* 04 Delivered: the output is the hero. */}
        <section ref={delivered} className="flex min-h-svh flex-col justify-center gap-8 px-6 py-[16vh] md:px-24">
          <p className="chapter-label">04 — Delivered</p>
          {approved ? (
            <div className="fade-in grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-[4px] border border-line bg-surface/85 p-5 font-mono backdrop-blur-sm">
                <p className="text-[11px] tracking-[0.2em] text-muted uppercase">Record · {final.route?.destination}</p>
                {order.fields
                  .map((field) => final.fields.findLast((f) => f.key === field.key && !f.struck))
                  .filter((f) => f !== undefined)
                  .map((f) => (
                    <div key={f.key} className="flex items-baseline justify-between gap-4 text-[13px]">
                      <span className="text-[10px] tracking-[0.12em] text-muted uppercase">{f.label}</span>
                      <span className={f.flag ? "text-right text-human" : "text-right"}>{f.value || "—"}</span>
                    </div>
                  ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="chapter-label">Reply · signed off by {order.signer}</p>
                <p className="font-serif text-xl leading-relaxed whitespace-pre-wrap text-fg/90">{final.draft}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-6">
              <p className="font-serif text-3xl text-fg/80">This work order is waiting for your sign-off.</p>
              <button
                type="button"
                onClick={() => scrollTo(signoff.current!.offsetTop + innerHeight * 0.4)}
                className="font-mono text-xs tracking-[0.2em] text-human uppercase hover:underline"
              >
                Go to sign-off ↑
              </button>
            </div>
          )}
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">{summary.join(" · ")}</p>
          <div className="flex flex-wrap gap-6 font-mono text-xs tracking-[0.2em] uppercase">
            <button type="button" onClick={() => seek(0)} className="text-fused hover:underline">
              Inspect any step ↑
            </button>
            <button type="button" onClick={() => scrollTo(choose.current!.offsetTop)} className="text-muted hover:text-fg">
              Try another work order
            </button>
          </div>
        </section>

        {/* 05 Selected work. */}
        <section ref={work} id="work" className="flex min-h-svh flex-col justify-center gap-8 px-6 py-[16vh] md:px-24">
          <p className="chapter-label">05 — Selected work</p>
          <ol className="flex flex-col border-t border-line">
            {projects.map((p, i) => (
              <li key={p.slug} className="border-b border-line">
                <Link
                  href={`/work/${p.slug}`}
                  className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 py-6 md:grid-cols-[4rem_1fr_10rem_6rem]"
                >
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-3xl transition-colors group-hover:text-machine md:text-5xl">{p.title}</span>
                  <span className="hidden font-mono text-xs text-muted md:inline">{p.kind}</span>
                  <span className="hidden font-mono text-xs text-muted md:inline">{p.year}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 06 Working together. */}
        <section ref={together} className="flex min-h-svh flex-col items-center justify-end gap-10 px-6 pt-[30vh] pb-[10vh] text-center">
          <p className="chapter-label reveal">06 — Working together</p>
          <h2 className="reveal max-w-3xl font-serif text-3xl leading-tight md:text-5xl">
            Complexity belongs in the engineering. <em className="text-fused">Not in the conversation.</em>
          </h2>
          <dl className="reveal grid grid-cols-3 gap-6 font-mono text-xs text-muted md:gap-16">
            <div>
              <dt>English</dt>
              <dd className="mt-1 font-serif text-3xl text-fg">IELTS 8.0</dd>
            </div>
            <div>
              <dt>Time zone</dt>
              <dd className="mt-1 font-serif text-3xl text-fg">GMT+X</dd>
            </div>
            <div>
              <dt>Works in</dt>
              <dd className="mt-1 font-serif text-3xl text-fg">Slack · Loom</dd>
            </div>
          </dl>
          <blockquote className="reveal max-w-xl font-serif text-xl text-fg/90 italic">
            “Placeholder testimonial about clear, calm communication.”
            <footer className="mt-2 font-mono text-xs not-italic text-muted">— Name, Role at Agency</footer>
          </blockquote>
          <div className="reveal flex gap-6 font-mono text-xs tracking-[0.2em] uppercase">
            <a href="mailto:hello@example.com" className="rounded-full border border-fused/40 px-5 py-3 text-fused hover:bg-fused/10">
              Start a project
            </a>
            <Link href="/about" className="px-5 py-3 text-muted hover:text-fg">
              About →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
