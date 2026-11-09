import type { RunEvent } from "../run/events.ts";
import type { Route, WorkOrder } from "../../content/work-orders.ts";

// What the pipeline needs from a language model. aiModel (model.ts) is the real one; canned.ts replays fixed answers.
export type Model = {
  read(order: WorkOrder): AsyncIterable<[key: string, value: string]>; // each field as soon as it's complete
  reread(order: WorkOrder, key: string, problem: string): Promise<string>;
  route(order: WorkOrder, values: Record<string, string>): Promise<Route>;
  draft(order: WorkOrder, values: Record<string, string>, route: Route, notes: string[]): AsyncIterable<string>;
};

const label = (order: WorkOrder, key: string) => order.fields.find((f) => f.key === key)?.label ?? key;

// The automation itself: the model reads, plain code checks (the model never grades itself),
// a rejected field is re-read once, then the model routes and drafts, and a person signs off.
export async function* runOrder(order: WorkOrder, model: Model, now: () => number): AsyncGenerator<RunEvent> {
  yield { t: now(), type: "run.start", order: order.id };
  const values: Record<string, string> = {};
  for await (const [key, value] of model.read(order)) {
    values[key] = value;
    yield { t: now(), type: "read.field", key, label: label(order, key), value };
  }

  for (const check of order.check(values)) {
    yield { t: now(), type: "check", ...check };
    if (check.result !== "reject" || !check.key) continue;
    yield { t: now(), type: "retry", attempt: 1, key: check.key };
    values[check.key] = await model.reread(order, check.key, check.note ?? check.rule);
    yield { t: now(), type: "read.field", key: check.key, label: label(order, check.key), value: values[check.key] };
    const again = order.check(values).find((c) => c.rule === check.rule)!;
    yield { t: now(), type: "check", ...again };
    if (again.result === "reject") return; // still invalid after a re-read: a person takes it from here
  }

  const route = await model.route(order, values);
  yield { t: now(), type: "route", ...route };
  const notes = order
    .check(values)
    .filter((c) => c.result === "flag")
    .map((c) => `${c.rule}: ${c.note ?? ""}`);
  for await (const text of model.draft(order, values, route, notes)) yield { t: now(), type: "write.delta", text };
  yield { t: now(), type: "approve.request" };
}
