import type { Run } from "@/lib/run/events";

// The run as a timeline: every event is a tick, the scroll position is the playhead. Click a tick to jump there.
export default function RunBar({ run, end, t, onSeek }: { run: Run; end: number; t: number; onSeek: (t: number) => void }) {
  const ticks = run.events.filter((e) => e.type !== "write.delta");
  const writing = run.events.filter((e) => e.type === "write.delta");
  const at = (time: number) => `${(Math.min(time, end) / end) * 100}%`;
  return (
    <div className="relative h-6 w-full" aria-label="Run timeline">
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      {writing.length > 0 && (
        <div
          className="absolute top-1/2 h-px bg-machine/60"
          style={{ left: at(writing[0].t), width: `calc(${at(writing.at(-1)!.t)} - ${at(writing[0].t)})` }}
        />
      )}
      {ticks.map((e, i) => {
        const human = (e.type === "check" && e.result !== "pass") || e.type === "approve.request";
        return (
          <button
            key={i}
            type="button"
            title={e.type === "check" ? `${e.rule}: ${e.result}` : e.type}
            onClick={() => onSeek(e.t)}
            className={`absolute top-1/2 h-3 w-px -translate-y-1/2 hover:h-5 ${human ? "bg-human" : "bg-muted"}`}
            style={{ left: at(e.t) }}
          />
        );
      })}
      <div className="pointer-events-none absolute top-0 h-full w-px bg-fg" style={{ left: at(t) }} />
      <span className="absolute -top-4 right-0 font-mono text-[10px] text-muted tabular-nums">
        {Math.min(t, end).toFixed(2)}s / {end.toFixed(2)}s
      </span>
    </div>
  );
}
