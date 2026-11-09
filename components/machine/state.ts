import type { Run } from "@/lib/run/events";
import { stateAt, type RunState } from "@/lib/run/state";
import referral from "@/lib/run/recordings/referral.json";
import brief from "@/lib/run/recordings/brief.json";
import lead from "@/lib/run/recordings/lead.json";

export const RUNS = { referral, brief, lead } as unknown as Record<Run["order"], Run>;

export type ShotName = "establishing" | "station" | "signoff" | "delivery" | "rest";

// Shared between the page (DOM) and the 3D stage; read every frame, so a plain object, not React state.
export const machine = {
  run: RUNS.referral,
  t: 0, // playhead, seconds into the run
  approved: false,
  hold: 0, // sign-off hold progress, 0..1
  shot: "establishing" as ShotName,
  invalidate: () => {}, // set by the Stage: renders a frame (the canvas only draws when something changes)
};

let cache: { run: Run; t: number; approved: boolean; state: RunState } | undefined;
// The run state for this frame, computed once however many parts ask.
export function current(): RunState {
  const { run, t, approved } = machine;
  if (cache?.run !== run || cache.t !== t || cache.approved !== approved) {
    cache = { run, t, approved, state: stateAt(run, t, approved) };
  }
  return cache.state;
}

export function loadRun(run: Run) {
  machine.run = run;
  machine.approved = false;
  machine.hold = 0;
  machine.invalidate();
}

export function approveRun() {
  machine.approved = true;
  machine.shot = "delivery"; // watch the card land in the tray
  machine.invalidate();
}
