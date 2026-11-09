import type { Run, RunEvent } from "./events.ts";

export const STATIONS = ["Intake", "Reader", "Checker", "Router", "Writer", "Sign-off", "Out tray"] as const;
export type Lamp = "off" | "machine" | "human" | "fused";
export type FieldRow = { key: string; label: string; value: string; t: number; struck?: boolean; flag?: string };
export type CheckRow = { rule: string; result: "pass" | "flag" | "reject"; note?: string; t: number };

export type RunState = {
  station: number; // the station acting on the card right now (6 = out tray, after sign-off)
  fields: FieldRow[];
  checks: CheckRow[];
  retrying: boolean;
  route: { destination: string; confidence: number; reason: string } | null;
  draft: string;
  waiting: boolean; // the run has asked for a person's sign-off
  approved: boolean;
  readSweep: number; // 0..1 position of the Reader's scanning bar in the current pass
  lamps: Lamp[]; // one per station
  rules: { rule: string; lamp: Lamp }[]; // one lamp per rule on the Checker
};

const STATION_OF: Record<RunEvent["type"], number> = {
  "run.start": 0,
  "read.field": 1,
  retry: 1,
  check: 2,
  route: 3,
  "write.delta": 4,
  "approve.request": 5,
};

// When the run stops for a person (or simply ends).
export const waitTime = (run: Run) => run.events.find((e) => e.type === "approve.request")?.t ?? run.events.at(-1)?.t ?? 0;

// Pure: everything the machine and the readouts show at time t. Scrubbing, pausing and rewinding are free.
export function stateAt(run: Run, t: number, approved = false): RunState {
  const s: RunState = {
    station: 0,
    fields: [],
    checks: [],
    retrying: false,
    route: null,
    draft: "",
    waiting: false,
    approved: false,
    readSweep: 0,
    lamps: STATIONS.map(() => "off"),
    rules: [],
  };
  const firstPass = run.events.findIndex((e) => e.type === "check");
  const firstPassReads = run.events.slice(0, firstPass < 0 ? undefined : firstPass).filter((e) => e.type === "read.field").length;
  const result = new Map<string, CheckRow["result"]>();
  for (const e of run.events) if (e.type === "check" && !result.has(e.rule)) result.set(e.rule, "pass"); // rule order
  const seen = new Set<string>();

  for (const e of run.events) {
    if (e.t > t) break;
    s.station = STATION_OF[e.type];
    if (e.type === "read.field") {
      s.fields.push({ key: e.key, label: e.label, value: e.value, t: e.t });
      s.readSweep = s.retrying ? 1 : s.fields.length / Math.max(1, firstPassReads);
    } else if (e.type === "retry") {
      s.retrying = true;
      s.readSweep = 0;
    } else if (e.type === "check") {
      s.retrying = false;
      s.checks.push({ rule: e.rule, result: e.result, note: e.note, t: e.t });
      result.set(e.rule, e.result);
      seen.add(e.rule);
      const field = e.key ? s.fields.findLast((f) => f.key === e.key) : undefined;
      if (field && e.result === "reject") field.struck = true;
      if (field && e.result === "flag") field.flag = e.note ?? e.rule;
    } else if (e.type === "route") {
      s.route = { destination: e.destination, confidence: e.confidence, reason: e.reason };
    } else if (e.type === "write.delta") {
      s.draft += e.text;
    } else if (e.type === "approve.request") {
      s.waiting = true;
    }
  }

  if (approved && s.waiting) {
    s.approved = true;
    s.waiting = false;
    s.station = 6;
  }
  s.rules = [...result].map(([rule, r]) => ({
    rule,
    lamp: !seen.has(rule) ? "off" : s.approved ? "fused" : r === "pass" ? "machine" : "human",
  }));
  s.lamps = STATIONS.map((_, i) =>
    s.approved ? "fused" : i !== s.station ? "off" : s.waiting ? "human" : "machine",
  );
  return s;
}

// Dev self-check: a reject strikes the field, the re-read adds a corrected row, a flag marks the field.
if (process.env.NODE_ENV === "development") {
  const run: Run = {
    order: "referral",
    source: "placeholder",
    events: [
      { t: 0, type: "run.start", order: "referral" },
      { t: 1, type: "read.field", key: "dob", label: "DOB", value: "12/O3/1986" },
      { t: 2, type: "check", rule: "valid", result: "reject", key: "dob" },
      { t: 3, type: "retry", attempt: 1, key: "dob" },
      { t: 4, type: "read.field", key: "dob", label: "DOB", value: "1986-03-12" },
      { t: 5, type: "check", rule: "valid", result: "pass", key: "dob" },
      { t: 6, type: "check", rule: "phone", result: "flag", key: "dob", note: "x" },
      { t: 7, type: "approve.request" },
    ],
  };
  const mid = stateAt(run, 3.5);
  const end = stateAt(run, 99, true);
  console.assert(mid.retrying && mid.station === 1 && mid.fields[0].struck, "stateAt: reject → retry");
  console.assert(end.fields.length === 2 && end.fields[1].flag === "x" && end.approved && end.station === 6, "stateAt: end");
  console.assert(stateAt(run, 99).waiting && stateAt(run, 99).lamps[5] === "human", "stateAt: waiting for a person");
}
