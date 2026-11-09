// PLACEHOLDER projects: replace with real work (and add `image` hero paths) in week 0 content pass.
export type Project = {
  slug: string;
  title: string;
  kind: "WebGL" | "AI" | "Automation";
  role: string;
  agency: string;
  client: string;
  year: number;
  summary: string;
  accent: string;
  problem: string;
  approach: string;
  result: string;
  stack: string[];
};

export const projects: Project[] = [
  {
    slug: "immersive-launch",
    title: "Immersive Launch",
    kind: "WebGL",
    role: "Creative developer",
    agency: "Agency name",
    client: "Client name",
    year: 2026,
    summary: "A scroll-driven WebGL launch site for a product reveal.",
    accent: "#bdebff",
    problem: "What the client needed and why it was hard.",
    approach: "How it was designed and built: the key technical and creative decisions.",
    result: "What shipped, and the measurable outcome.",
    stack: ["Three.js", "GSAP", "Next.js"],
  },
  {
    slug: "ai-concierge",
    title: "AI Concierge",
    kind: "AI",
    role: "AI engineer",
    agency: "Agency name",
    client: "Client name",
    year: 2025,
    summary: "An LLM-powered assistant that answers and acts for a brand's customers.",
    accent: "#ffb070",
    problem: "What the client needed and why it was hard.",
    approach: "Architecture, tools, evaluation and guardrails.",
    result: "What shipped, and the measurable outcome.",
    stack: ["AI SDK", "Claude", "Next.js"],
  },
  {
    slug: "studio-site",
    title: "Studio Site",
    kind: "WebGL",
    role: "Creative developer",
    agency: "Agency name",
    client: "Client name",
    year: 2025,
    summary: "A design studio's portfolio with shader-driven transitions.",
    accent: "#f4efe6",
    problem: "What the client needed and why it was hard.",
    approach: "How it was designed and built: the key technical and creative decisions.",
    result: "What shipped, and the measurable outcome.",
    stack: ["R3F", "GLSL", "Next.js"],
  },
  {
    slug: "ops-automation",
    title: "Ops Automation",
    kind: "Automation",
    role: "AI engineer",
    agency: "Agency name",
    client: "Client name",
    year: 2024,
    summary: "Agentic workflows that replaced hours of manual operations work each week.",
    accent: "#ffcf9a",
    problem: "What the client needed and why it was hard.",
    approach: "Workflow design, integrations and human-in-the-loop review.",
    result: "What shipped, and the measurable outcome.",
    stack: ["AI SDK", "Node.js", "Integrations"],
  },
];
