import Link from "next/link";

// PLACEHOLDER copy: replace with your own words in the content pass.
export default function About() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-16 px-6 py-24 md:py-32">
      <Link href="/" className="chapter-label hover:text-fg">
        ← Back to the experience
      </Link>

      <header className="flex flex-col gap-4">
        <p className="chapter-label">About</p>
        <h1 className="font-serif text-5xl leading-tight md:text-7xl">Your Name</h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">AI Engineer &amp; Creative Developer</p>
        <p className="max-w-xl text-lg text-fg/80">I build AI-powered products and immersive web experiences.</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="chapter-label">The path</h2>
        <p className="font-serif text-2xl leading-snug">
          My path into technology wasn&apos;t conventional. It began alongside a healthcare education, clinical training and
          time spent working in a hospital. In 2020, the year my internship started, I also built my first client website.
          Since then I&apos;ve moved from WordPress to frontend, to full stack, to AI engineering.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="chapter-label">Working with studios</h2>
        <ul className="flex flex-col gap-2 text-lg text-fg/80">
          <li>Build from your Figma, or design directly in code with you.</li>
          <li>Join your Slack, take briefs, and talk to your clients when needed.</li>
          <li>Comfortable with NDAs and white-label work. Private work available on request.</li>
          <li>Stack: Three.js, R3F, GLSL, GSAP, Next.js, LLM APIs, agents and automation.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="chapter-label">Communication</h2>
        <p className="text-lg text-fg/80">IELTS 8.0 overall. Time zone GMT+X, with overlap for EU and US mornings.</p>
      </section>

      <a href="mailto:hello@example.com" className="border-t border-fg/10 pt-8 font-serif text-3xl hover:text-fused">
        Start a project →
      </a>
    </main>
  );
}
