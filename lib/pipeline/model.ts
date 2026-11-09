import { generateText, Output, streamText } from "ai";
import { z } from "zod";
import type { Model } from "./run.ts";

const MODEL = "anthropic/claude-haiku-5.5"; // via Vercel AI Gateway; needs AI_GATEWAY_API_KEY
const ADMIN_ONLY =
  "You are an administrative document assistant. Extract, route and draft only. Never give clinical advice, diagnose or judge urgency.";

export const aiModel: Model = {
  async *read(order) {
    const schema = z.object(Object.fromEntries(order.fields.map((f) => [f.key, z.string().describe(f.hint)])));
    const { partialOutputStream } = streamText({
      model: MODEL,
      system: `${ADMIN_ONLY} Copy values exactly as written; use an empty string when a value is absent.`,
      prompt: order.input,
      output: Output.object({ schema }),
    });
    // A field is complete once the model has moved on to the next one.
    let done = 0;
    let last: Record<string, unknown> = {};
    for await (const partial of partialOutputStream) {
      last = (partial ?? {}) as Record<string, unknown>;
      while (done < order.fields.length - 1 && order.fields[done + 1].key in last) {
        const key = order.fields[done++].key;
        yield [key, String(last[key] ?? "")];
      }
    }
    const final = schema.parse(last);
    for (; done < order.fields.length; done++) yield [order.fields[done].key, final[order.fields[done].key]];
  },

  async reread(order, key, problem) {
    const field = order.fields.find((f) => f.key === key)!;
    const { output } = await generateText({
      model: MODEL,
      system: ADMIN_ONLY,
      prompt: `${order.input}\n\nRe-read one field: ${field.label} (${field.hint}). The previous reading was rejected: ${problem}. Return the corrected value only.`,
      output: Output.object({ schema: z.object({ value: z.string() }) }),
    });
    return output.value;
  },

  async route(order, values) {
    const { output } = await generateText({
      model: MODEL,
      system: ADMIN_ONLY,
      prompt: `Route this work order to one destination.\n\n${JSON.stringify(values, null, 2)}`,
      output: Output.object({
        schema: z.object({
          destination: z.enum(order.destinations as [string, ...string[]]),
          confidence: z.number().min(0).max(1),
          reason: z.string().max(120).describe("One short line, citing the document"),
        }),
      }),
    });
    return output;
  },

  async *draft(order, values, route, notes) {
    const result = streamText({
      model: MODEL,
      system: `${ADMIN_ONLY} ${order.draftBrief}`,
      prompt: JSON.stringify({ fields: values, routedTo: route.destination, openIssues: notes }, null, 2),
      maxOutputTokens: 400,
    });
    yield* result.textStream;
  },
};
