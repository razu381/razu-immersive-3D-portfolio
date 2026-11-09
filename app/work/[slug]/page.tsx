import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <main>
      {/* The organism keeps this project's form behind the first screen (see Background). */}
      <Link href="/#work" className="chapter-label fixed top-5 left-5 z-10 hover:text-fg md:top-8 md:left-8">
        ← Back to the experience
      </Link>

      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6 pb-24 md:pb-32">
        <header className="flex min-h-svh flex-col justify-end gap-4 pb-[8vh]">
          <p className="chapter-label">
            Case study · {String(index + 1).padStart(2, "0")} · {project.kind}
          </p>
          <h1 className="font-serif text-5xl leading-tight md:text-7xl" style={{ color: project.accent }}>
            {project.title}
          </h1>
          <p className="max-w-xl text-lg text-fg/80">{project.summary}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs text-muted md:grid-cols-4">
            {[
              ["Role", project.role],
              ["Agency", project.agency],
              ["Client", project.client],
              ["Year", project.year],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="mt-1 text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {[
          ["Problem", project.problem],
          ["Approach", project.approach],
          ["Result", project.result],
        ].map(([heading, body]) => (
          <section key={heading} className="flex flex-col gap-3">
            <h2 className="chapter-label">{heading}</h2>
            <p className="font-serif text-2xl leading-snug md:text-3xl">{body}</p>
          </section>
        ))}

        <section className="flex flex-col gap-3">
          <h2 className="chapter-label">Stack</h2>
          <p className="font-mono text-sm">{project.stack.join(" · ")}</p>
        </section>

        <Link href={`/work/${next.slug}`} className="border-t border-fg/10 pt-8 font-serif text-3xl hover:text-fused">
          Next: {next.title} →
        </Link>
      </div>
    </main>
  );
}
