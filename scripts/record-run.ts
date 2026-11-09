// Records a run of the real pipeline to lib/run/recordings/<order>.json, which the site replays.
//   node --env-file=.env.local scripts/record-run.ts referral   (real model; needs AI_GATEWAY_API_KEY)
//   node scripts/record-run.ts referral --placeholder            (canned answers, placeholder timing)
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { workOrder } from "../content/work-orders.ts";
import { ORDER_IDS, type OrderId, type Run, type RunEvent } from "../lib/run/events.ts";
import { runOrder } from "../lib/pipeline/run.ts";
import { cannedModel, pace } from "../lib/pipeline/canned.ts";

const [id, flag] = process.argv.slice(2) as [OrderId, string?];
if (!ORDER_IDS.includes(id)) throw new Error(`Usage: record-run.ts <${ORDER_IDS.join("|")}> [--placeholder]`);
const placeholder = flag === "--placeholder";

const start = performance.now();
const now = () => Math.round((performance.now() - start) / 10) / 100;
const model = placeholder ? cannedModel : (await import("../lib/pipeline/model.ts")).aiModel;

const events: RunEvent[] = [];
for await (const event of runOrder(workOrder(id), model, now)) events.push(event);

const run: Run = { order: id, source: placeholder ? "placeholder" : "recorded", events: placeholder ? pace(events) : events };
const file = fileURLToPath(new URL(`../lib/run/recordings/${id}.json`, import.meta.url));
writeFileSync(file, JSON.stringify(run, null, 1) + "\n");
console.log(`${run.source} run: ${events.length} events, ${run.events.at(-1)!.t}s → ${file}`);
