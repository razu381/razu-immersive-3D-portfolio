import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { z } from "zod";
import { projects } from "@/content/projects";

export const maxDuration = 30;

const slugs = projects.map((p) => p.slug) as [string, ...string[]];

// PLACEHOLDER facts: keep in sync with the About page when real content lands.
const instructions = `You are the AI guide on the portfolio of Your Name, an AI Engineer & Creative Developer who builds AI-powered products and immersive web experiences, mostly for agencies and studios.
Speak about Your Name in the third person, by name. Be warm, calm and brief: one to three short sentences.
Use only the facts below. If something isn't covered, say you don't know and offer a call.
Never invent clients, projects, numbers, rates, dates or availability. For rates, timelines or availability, call book_call.
When a project is relevant, call show_project once with its slug, then answer in text. Call open_case_study only when the visitor asks for details.
Stay on topic: the work, skills, process and collaboration. Politely decline anything else.

Facts:
- Background: healthcare education and clinical training; started freelancing in 2020 alongside a hospital internship. Path: WordPress → frontend → full stack → AI engineering.
- With agencies: builds from their Figma or designs directly in code; joins their Slack; comfortable with NDAs and white-label work.
- English: IELTS 8.0 overall. Time zone: GMT+X.
- Stack: Three.js, React Three Fiber, GLSL, GSAP, Next.js, AI SDK, LLM APIs, agents and automation.

Projects:
${projects.map((p) => `- ${p.slug}: ${p.title} (${p.kind}, ${p.year}). ${p.summary} Role: ${p.role}. Stack: ${p.stack.join(", ")}.`).join("\n")}`;

// shortcut: in-memory per-instance rate limit; move to a Marketplace Redis store before launch.
const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const hit = hits.get(ip);
  if (!hit || hit.reset < now) hits.set(ip, { count: 1, reset: now + WINDOW_MS });
  else if (++hit.count > LIMIT) return new Response("Too many requests", { status: 429 });

  const body = await req.text();
  if (body.length > 20_000) return new Response("Conversation too long", { status: 413 });
  const { messages, page } = JSON.parse(body) as { messages: UIMessage[]; page?: string };
  // Only a known slug reaches the prompt, never the raw page string.
  const reading = projects.find((p) => page === `/work/${p.slug}`);

  const result = streamText({
    model: "anthropic/claude-haiku-5.5",
    instructions: reading ? `${instructions}\n\nThe visitor is reading the case study: ${reading.slug}.` : instructions,
    messages: await convertToModelMessages(messages.slice(-12)),
    maxOutputTokens: 300,
    tools: {
      show_project: {
        description: "Move the 3D scene to a project so the visitor can see it.",
        inputSchema: z.object({ slug: z.enum(slugs) }),
      },
      open_case_study: {
        description: "Open a project's case study page.",
        inputSchema: z.object({ slug: z.enum(slugs) }),
      },
      book_call: {
        description: "Offer to start a project or book a call (for rates, timelines and availability).",
        inputSchema: z.object({}),
      },
    },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
