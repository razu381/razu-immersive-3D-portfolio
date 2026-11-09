import type { WorkOrder } from "@/content/work-orders";
import { STATIONS, type FieldRow, type RunState } from "@/lib/run/state";

// What each station really does, in one line: the technical side, said plainly.
export const STATION_NOTES = [
  "The work order arrives as a messy, real-world document.",
  "The model pulls structured fields out of it, streamed as each one completes.",
  "Plain code checks every field. The model never grades its own work.",
  "The model picks a destination and has to say why.",
  "The reply is drafted and streamed, exactly as it was written.",
  "Nothing leaves without a person.",
  "Delivered: a clean record and a reply, ready to send.",
];

const fresh = (t: number, at: number) => t - at < 0.9;

function Row({ row, t }: { row: FieldRow; t: number }) {
  return (
    <div className={`flex flex-col gap-0.5 ${row.flag ? "border-l-2 border-human pl-2" : ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 text-[10px] tracking-[0.12em] text-muted uppercase">{row.label}</span>
        <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-line" />
        <span
          className={`max-w-[60%] text-right text-[13px] transition-colors duration-700 ${
            row.struck ? "text-muted line-through" : row.flag ? "text-human" : fresh(t, row.t) ? "text-machine" : "text-fg"
          }`}
        >
          {row.value || "—"}
        </span>
      </div>
      {row.struck && <span className="text-right text-[10px] tracking-[0.12em] text-human uppercase">Rejected · re-read</span>}
      {row.flag && <span className="text-[11px] text-muted">{row.flag}</span>}
    </div>
  );
}

// The readout for the station acting right now: the real data at this moment of the run.
export default function Readout({ state, order, t }: { state: RunState; order: WorkOrder; t: number }) {
  const station = Math.max(0, state.station);
  return (
    <div className="flex max-h-[62svh] w-full flex-col gap-4 overflow-hidden rounded-[4px] border border-line bg-surface/85 p-4 font-mono backdrop-blur-sm md:w-[24rem]">
      <p className="flex justify-between text-[11px] tracking-[0.2em] text-muted uppercase">
        <span>
          {String(station + 1).padStart(2, "0")} · {STATIONS[station]}
        </span>
        <span>{order.number}</span>
      </p>

      {station === 0 && (
        <pre className="text-[11px] leading-relaxed whitespace-pre-wrap text-fg/70">{order.input}</pre>
      )}
      {station === 1 && (
        <div className="flex flex-col gap-2">
          {state.fields.map((row, i) => (
            <Row key={i} row={row} t={t} />
          ))}
        </div>
      )}
      {station === 2 && (
        <div className="flex flex-col gap-2">
          {state.checks.map((c, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className={c.result === "pass" ? "text-fg/80" : "text-fg"}>{c.rule}</span>
                <span
                  className={`text-[10px] tracking-[0.15em] uppercase ${c.result === "pass" ? "text-machine" : "text-human"}`}
                >
                  {c.result === "pass" ? "Pass" : c.result === "flag" ? "Flag" : "Reject"}
                </span>
              </div>
              {c.note && <span className="text-[11px] text-muted">{c.note}</span>}
            </div>
          ))}
          {state.retrying && <span className="text-[11px] text-machine">Re-reading one field…</span>}
        </div>
      )}
      {station === 3 && state.route && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.12em] text-muted uppercase">Routed to</span>
          <span className="font-serif text-3xl text-fg">{state.route.destination}</span>
          <span className="text-[12px] text-machine">Confidence {state.route.confidence.toFixed(2)}</span>
          <span className="text-[12px] text-fg/70">“{state.route.reason}”</span>
        </div>
      )}
      {station === 4 && (
        <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-fg/90">
          {state.draft}
          <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-machine" />
        </p>
      )}
      {station >= 5 && (
        <p className="text-[12px] text-human">
          {state.approved ? "Signed off." : `Awaiting sign-off · ${order.signer}`}
        </p>
      )}
    </div>
  );
}
