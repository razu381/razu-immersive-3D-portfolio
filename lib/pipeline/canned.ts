import type { Model } from "./run.ts";
import type { RunEvent } from "../run/events.ts";

// Replays each work order's canned answers through the real pipeline, so the placeholder run
// exercises the same checks and retry logic as a recorded one. Replace with `scripts/record-run.ts <id>`.
export const cannedModel: Model = {
  async *read(order) {
    for (const f of order.fields) yield [f.key, order.canned.read[f.key] ?? ""];
  },
  async reread(order, key) {
    return order.canned.reread[key] ?? order.canned.read[key] ?? "";
  },
  async route(order) {
    return order.canned.route;
  },
  async *draft(order) {
    yield* order.canned.draft.match(/\S+\s*/g) ?? [];
  },
};

// Placeholder timing, roughly what a fast model takes per step (seconds after the previous event).
const GAP: Record<RunEvent["type"], number> = {
  "run.start": 0,
  "read.field": 0.3,
  check: 0.45,
  retry: 0.5,
  route: 1.1,
  "write.delta": 0.05,
  "approve.request": 0.8,
};

export function pace(events: RunEvent[]): RunEvent[] {
  let t = 0;
  return events.map((e, i) => {
    const first = i > 0 && e.type !== events[i - 1].type;
    t += GAP[e.type] + (first && (e.type === "read.field" || e.type === "write.delta") ? 0.6 : 0);
    return { ...e, t: Math.round(t * 100) / 100 };
  });
}
