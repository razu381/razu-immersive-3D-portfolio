"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { projects } from "@/content/projects";
import { OWN_STAGE } from "./Background";
import { experience } from "./state";

// PLACEHOLDER answers, shown when the guide is offline (no key, budget spent, rate limited).
// Keep in sync with the facts in app/api/guide/route.ts.
const PROMPTS: Record<string, string> = {
  "Show me your WebGL work":
    "This site is one example: a single GPU particle system drives every scene. Scroll to Selected work to see the rest, each one rebuilt in particles.",
  "Have you worked with agencies?":
    "Yes. Your Name works mostly with agencies and studios: building from your Figma or designing in code, joining your Slack, and comfortable with NDAs and white-label work.",
  "What's your AI stack?": "LLM APIs through the AI SDK, agents and automation, on Next.js. This guide is a small example.",
  "Can you build from our Figma?": "Yes, or design directly in code with you. Both work.",
  "Time zone and availability?":
    "GMT+X, with overlap for EU and US mornings. For availability, email Your Name and you'll get a reply.",
};
const CONTACT = "mailto:hello@example.com";

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();

// shortcut: browser speech recognition only (Chrome, Edge, Safari); add server transcription if Firefox voice matters.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
const getRecognition = () => {
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

// Mic loudness drives the organism's ripples. Audio stays in the browser and is never stored.
function meter(stream: MediaStream) {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const data = new Uint8Array(analyser.fftSize);
  let raf = 0;
  const tick = () => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += ((v - 128) / 128) ** 2;
    experience.voice = Math.min(1, Math.sqrt(sum / data.length) * 6);
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => {
    cancelAnimationFrame(raf);
    experience.voice = 0;
    stream.getTracks().forEach((t) => t.stop());
    ctx.close();
  };
}

const onReady = (cb: () => void) => {
  addEventListener("guide:ready", cb);
  return () => removeEventListener("guide:ready", cb);
};
const noop = () => () => {};

export default function Guide() {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useSyncExternalStore(onReady, () => experience.guideReady, () => false);
  const canListen = useSyncExternalStore(noop, () => !!getRecognition(), () => false);
  const visible = !OWN_STAGE.includes(pathname) && (ready || pathname !== "/");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState(false); // replies are read aloud once the visitor has spoken
  const voiceRef = useRef(false);
  const spoken = useRef({ id: "", length: 0 });
  const stopListening = useRef<(() => void) | null>(null);

  const { messages, sendMessage, addToolOutput, status, error } = useChat({
    // The guide knows which case study the visitor is reading.
    transport: new DefaultChatTransport({ api: "/api/guide", body: () => ({ page: location.pathname }) }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      if (toolCall.dynamic) return;
      const slug = (toolCall.input as { slug?: string }).slug;
      const index = projects.findIndex((p) => p.slug === slug);
      if (toolCall.toolName === "show_project" && index >= 0) {
        if (location.pathname === "/") dispatchEvent(new CustomEvent("guide:show", { detail: index }));
        else router.push(`/work/${slug}`);
      }
      if (toolCall.toolName === "open_case_study" && index >= 0) router.push(`/work/${slug}`);
      if (toolCall.toolName === "book_call") window.location.assign(CONTACT);
      addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: "done" });
    },
    onFinish({ message }) {
      if (!voiceRef.current) return;
      const text = textOf(message);
      const fresh = text.slice(spoken.current.id === message.id ? spoken.current.length : 0).trim();
      spoken.current = { id: message.id, length: text.length };
      if (!fresh) return;
      const utterance = new SpeechSynthesisUtterance(fresh);
      utterance.onstart = () => (experience.speaking = 1);
      utterance.onend = utterance.onerror = () => (experience.speaking = 0);
      speechSynthesis.speak(utterance);
    },
  });

  // Guide states → organism: thinking tightens the threads, speaking ripples the form.
  useEffect(() => {
    experience.thinking = status === "submitted" ? 1 : 0;
    experience.speaking = status === "streaming" ? 1 : 0;
  }, [status]);

  const setVoiceMode = (on: boolean) => {
    voiceRef.current = on;
    setVoice(on);
    if (!on) speechSynthesis.cancel();
  };
  const close = () => {
    setOpen(false);
    stopListening.current?.();
    speechSynthesis.cancel();
  };

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && visible && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        speechSynthesis.cancel();
      }
    };
    addEventListener("guide:open", onOpen);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("guide:open", onOpen);
      removeEventListener("keydown", onKey);
    };
  }, [visible]);

  const ask = (text: string) => {
    if (!text.trim() || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  };

  const listen = () => {
    if (stopListening.current) return stopListening.current();
    const Recognition = getRecognition();
    if (!Recognition) return;
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    let heard = "";
    let ended = false;
    let stopMeter = () => {};
    rec.onresult = (e) => {
      heard = Array.from(e.results, (r) => r[0].transcript).join("");
      setInput(heard);
    };
    rec.onend = () => {
      ended = true;
      stopMeter();
      stopListening.current = null;
      setListening(false);
      if (heard.trim()) {
        setVoiceMode(true);
        ask(heard);
      }
    };
    stopListening.current = () => rec.stop();
    setListening(true);
    speechSynthesis.cancel();
    rec.start();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(meter)
      .then((stop) => (ended ? stop() : (stopMeter = stop)))
      .catch(() => {}); // no meter is fine; recognition still works
  };

  if (!visible) return null;
  const lastAsk = messages.findLast((m) => m.role === "user");
  const scripted = error && lastAsk ? PROMPTS[textOf(lastAsk)] : undefined;
  const busy = listening || status === "submitted" || status === "streaming";

  return (
    <div className="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-3 md:right-8 md:bottom-8">
      {open && (
        <div className="flex max-h-[70svh] w-[min(26rem,calc(100vw-2rem))] flex-col gap-4 rounded-2xl border border-fg/10 bg-bg/85 p-5 backdrop-blur-xl">
          <div className="flex items-baseline justify-between gap-4">
            <p className="chapter-label">AI guide · answers from the case studies</p>
            <span className="flex gap-4">
              {voice && (
                <button type="button" className="chapter-label hover:text-fg" onClick={() => setVoiceMode(false)}>
                  Voice off
                </button>
              )}
              <button type="button" className="chapter-label hover:text-fg" onClick={close}>
                Close
              </button>
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto text-sm leading-relaxed" data-lenis-prevent>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.keys(PROMPTS).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => ask(p)}
                    className="rounded-full border border-fg/15 px-3 py-1.5 text-xs text-fg/80 hover:border-fused/50 hover:text-fg"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "self-end text-right text-muted" : "text-fg"}>
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <p key={i}>{part.text}</p>
                  ) : part.type.startsWith("tool-") ? (
                    <p key={i} className="font-mono text-[11px] text-human">
                      → {part.type.slice(5).replace("_", " ")}
                    </p>
                  ) : null,
                )}
              </div>
            ))}
            {status === "submitted" && <p className="text-muted">…</p>}
            {error &&
              (scripted ? (
                <div>
                  <p>{scripted}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Saved answer · guide offline</p>
                </div>
              ) : (
                <p className="text-muted">
                  The guide is offline right now.{" "}
                  <a href={CONTACT} className="text-fused underline">
                    Email instead
                  </a>
                  .
                </p>
              ))}
          </div>

          <form
            className="flex items-center gap-3 border-t border-fg/10 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={listening ? "Listening…" : "Ask about the work…"}
              aria-label="Ask the AI guide"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            {canListen && (
              <button
                type="button"
                onClick={listen}
                aria-pressed={listening}
                className={`chapter-label flex items-center gap-2 ${listening ? "text-human" : "hover:text-fg"}`}
              >
                {listening && <span className="size-1.5 animate-pulse rounded-full bg-human" />}
                {listening ? "Mic on · stop" : "Speak"}
              </button>
            )}
            <button type="submit" className="chapter-label hover:text-fg">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="flex items-center gap-3 rounded-full border border-fg/15 bg-bg/70 py-2 pr-4 pl-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg backdrop-blur hover:border-fused/50"
      >
        <span
          className={`size-6 rounded-full bg-[radial-gradient(circle,var(--fused),var(--human)_45%,transparent_70%)] shadow-[0_0_18px_var(--human)] ${busy ? "animate-pulse" : ""}`}
        />
        {open ? "Close guide" : "Ask the guide"}
        <kbd className="text-muted">/</kbd>
      </button>
    </div>
  );
}
