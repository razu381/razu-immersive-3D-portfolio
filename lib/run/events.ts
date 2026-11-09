import { z } from "zod";

// One event log drives everything: the recorded replay, the live run, the machine and the readouts.
export const ORDER_IDS = ["referral", "brief", "lead"] as const;
export type OrderId = (typeof ORDER_IDS)[number];

export const runEvent = z.discriminatedUnion("type", [
  z.object({ t: z.number(), type: z.literal("run.start"), order: z.enum(ORDER_IDS) }),
  z.object({ t: z.number(), type: z.literal("read.field"), key: z.string(), label: z.string(), value: z.string() }),
  z.object({
    t: z.number(),
    type: z.literal("check"),
    rule: z.string(),
    result: z.enum(["pass", "flag", "reject"]),
    key: z.string().optional(), // the field the rule is about
    note: z.string().optional(),
  }),
  z.object({ t: z.number(), type: z.literal("retry"), attempt: z.number(), key: z.string() }),
  z.object({
    t: z.number(),
    type: z.literal("route"),
    destination: z.string(),
    confidence: z.number(),
    reason: z.string(),
  }),
  z.object({ t: z.number(), type: z.literal("write.delta"), text: z.string() }),
  z.object({ t: z.number(), type: z.literal("approve.request") }),
]);
export type RunEvent = z.infer<typeof runEvent>;

// "recorded": a real pipeline run saved to disk. "placeholder": hand-built until a real run is recorded.
export type Run = { order: OrderId; source: "recorded" | "placeholder" | "live"; events: RunEvent[] };
