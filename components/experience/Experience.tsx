"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { projects } from "@/content/projects";
import { experience } from "./state";
import HoldToMerge from "./HoldToMerge";

const CHAPTERS = ["Signal", "Two strands", "Craft", "The merge", "It listens", "Selected work", "Shared language"];
const SEEN = "parallel:seen";
const seen = () => {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// 0 → 1 as the element's top scrolls from the bottom of the viewport to the top.
const entered = (el: HTMLElement) => clamp01((innerHeight - el.getBoundingClientRect().top) / innerHeight);
// 0 → 1 while a tall section scrolls past its sticky content.
const through = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return clamp01(-r.top / (r.height - innerHeight));
};

export default function Experience() {
  const signal = useRef<HTMLElement>(null);
  const strands = useRef<HTMLElement>(null);
  const craft = useRef<HTMLElement>(null);
  const merge = useRef<HTMLElement>(null);
  const after = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const contact = useRef<HTMLElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const [project, setProject] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [sound, setSound] = useState(false);
  const returning = useSyncExternalStore(() => () => {}, seen, () => false);
  const [welcomed, setWelcomed] = useState(false);
  const sections = [signal, strands, craft, merge, after, work, contact];

  const scrollTo = (y: number) => (lenis.current ? lenis.current.scrollTo(y) : window.scrollTo({ top: y }));
  const showProject = (i: number) => {
    const el = work.current!;
    scrollTo(el.offsetTop + ((i + 0.5) / projects.length) * (el.offsetHeight - innerHeight));
  };

  useEffect(() => {
    experience.project = -1; // coming back from a case study: resync the overlay with the organism
    const onScroll = () => {
      const vh = innerHeight;
      experience.split = entered(strands.current!);
      const c = craft.current!.getBoundingClientRect();
      experience.craft = clamp01((vh - c.top) / vh) * (1 - clamp01((vh - c.bottom) / vh));
      experience.inMergeZone = merge.current!.getBoundingClientRect().top < vh * 0.5;
      const afterTop = after.current!.getBoundingClientRect().top;
      if (afterTop < vh * 0.6) experience.merge = 1; // scrolling past auto-plays the merge
      if (afterTop < vh * 0.8 && !experience.guideReady) {
        experience.guideReady = true; // the guide is introduced in scene 04, then stays on every page
        dispatchEvent(new Event("guide:ready"));
      }
      experience.work = entered(work.current!);
      if (experience.work > 0.5 && !seen()) {
        try {
          localStorage.setItem(SEEN, "1"); // returning visitors get "Continue / Watch again"
        } catch {}
      }
      const index = Math.min(projects.length - 1, Math.floor(through(work.current!) * projects.length));
      if (index !== experience.project) {
        experience.project = index;
        setProject(index);
      }
      experience.line = entered(contact.current!);
      setChapter(Math.max(0, sections.findLastIndex((r) => r.current!.getBoundingClientRect().top <= vh * 0.5)));
    };
    const onShow = (e: Event) => showProject((e as CustomEvent<number>).detail);
    const onPointer = (e: PointerEvent) => {
      experience.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      experience.pointer.y = 1 - (e.clientY / innerHeight) * 2;
      experience.pointer.active = 1;
    };
    // Lenis moves the native scroll position, so one native listener covers both cases.
    lenis.current = matchMedia("(prefers-reduced-motion: reduce)").matches ? null : new Lenis({ autoRaf: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("guide:show", onShow);
    onScroll();
    return () => {
      lenis.current?.destroy();
      removeEventListener("guide:show", onShow);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sections and showProject only read refs; bind once
  }, []);

  const current = projects[project];

  return (
    <>

      <header className="fixed inset-x-0 top-0 z-10 flex items-baseline justify-between gap-6 p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:p-8">
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

      <nav aria-label="Chapters" className="fixed top-1/2 left-5 z-10 hidden -translate-y-1/2 flex-col gap-3 font-mono text-[10px] tracking-[0.2em] md:left-8 md:flex">
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

      {returning && !welcomed && chapter === 0 && (
        <div className="fade-in fixed inset-x-0 top-20 z-10 flex justify-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="text-muted">Welcome back</span>
          <button
            type="button"
            className="text-fused hover:underline"
            onClick={() => {
              setWelcomed(true);
              scrollTo(work.current!.offsetTop);
            }}
          >
            Continue to work →
          </button>
          <button type="button" className="text-muted hover:text-fg" onClick={() => setWelcomed(true)}>
            Watch again
          </button>
        </div>
      )}

      <main>
        <section ref={signal} className="chapter flex h-svh flex-col items-center justify-end gap-4 px-6 pb-[14vh] text-center">
          <p className="chapter-label fade-in">00 — Signal</p>
          <h1 className="fade-in max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Before I learned to build, I learned to observe.
          </h1>
        </section>

        <section ref={strands} className="chapter h-[220svh]">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-between px-6 pt-[14vh] pb-[12vh] text-center">
            <p className="chapter-label reveal">01 — Two strands · 2020</p>
            <h2 className="reveal max-w-3xl font-serif text-3xl leading-tight md:text-5xl">
              Every story has an origin. <em className="text-human">Mine has two.</em>
            </h2>
            <span className="strand-label reveal left-[12%] text-human portrait:top-[24%] portrait:inset-x-0 landscape:top-[66%]">
              2020 · clinical internship
            </span>
            <span className="strand-label reveal right-[12%] text-machine portrait:bottom-[26%] portrait:inset-x-0 landscape:top-[66%]">
              2020 · first client site
            </span>
          </div>
        </section>

        <section ref={craft} className="chapter h-[240svh]">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-between px-6 pt-[14vh] pb-[12vh] text-center">
            <p className="chapter-label reveal">02 — Craft</p>
            <div className="flex flex-col items-center gap-4">
              <h2 className="reveal max-w-3xl font-serif text-3xl leading-tight md:text-5xl">
                I stopped separating how things look from <em className="text-machine">how they work.</em>
              </h2>
              <p className="reveal font-mono text-xs tracking-[0.15em] text-muted">
                WordPress → Frontend → Full stack · designed in code
              </p>
            </div>
          </div>
        </section>

        <section ref={merge} className="chapter h-[200svh]">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-end gap-8 px-6 pb-[12vh]">
            <p className="chapter-label reveal">03 — The merge</p>
            <HoldToMerge />
          </div>
        </section>

        <section ref={after} className="chapter flex h-svh flex-col items-center justify-end gap-4 px-6 pb-[14vh] text-center">
          <p className="chapter-label reveal">04 — It listens</p>
          <h2 className="reveal font-serif text-3xl md:text-5xl">Ask about the work.</h2>
          <p className="reveal max-w-md text-sm text-fg/70">
            An AI guide that knows every case study. It can show you projects and open the details.
          </p>
          <button
            type="button"
            onClick={() => dispatchEvent(new Event("guide:open"))}
            className="reveal rounded-full border border-fused/40 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-fused hover:bg-fused/10"
          >
            Ask the guide
          </button>
        </section>

        <section ref={work} id="work" className="chapter" style={{ height: `${projects.length * 100 + 60}svh` }}>
          <div className="sticky top-0 flex h-svh items-end justify-between gap-8 px-6 pb-[10vh] md:px-12">
            <div className="flex max-w-xl flex-col gap-3">
              <p className="chapter-label">
                05 — Selected work · {String(project + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </p>
              <h2 key={current.slug} className="fade-in font-serif text-4xl md:text-6xl">
                {current.title}
              </h2>
              <p className="font-mono text-xs text-muted">
                {current.role} · {current.agency} · {current.client} · {current.year}
              </p>
              <p className="max-w-md text-sm text-fg/80">{current.summary}</p>
              <Link href={`/work/${current.slug}`} className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-fused hover:underline">
                Open case study →
              </Link>
            </div>
            <ol className="hidden flex-col gap-2 text-right font-mono text-xs md:flex">
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <button type="button" onClick={() => showProject(i)} className={i === project ? "text-fg" : "text-muted hover:text-fg"}>
                    {p.title} <span className="text-muted">· {p.kind}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section ref={contact} className="chapter flex min-h-svh flex-col items-center justify-end gap-10 px-6 pt-[45vh] pb-[10vh] text-center">
          <p className="chapter-label reveal">06 — Shared language</p>
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
          <div className="reveal flex gap-6 font-mono text-xs uppercase tracking-[0.2em]">
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
