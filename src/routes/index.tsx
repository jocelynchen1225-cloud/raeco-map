import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AAL Innovation — AI Adoption Research for AEC" },
      {
        name: "description",
        content:
          "Research-led AI strategy and practical implementation for architecture, engineering and construction leaders. Scenario maps, tool assessments and adoption benchmarks that hold up on real projects.",
      },
      { property: "og:title", content: "AAL Innovation — AI Adoption Research for AEC" },
      {
        property: "og:description",
        content:
          "Helping AEC leaders turn AI potential into measurable project outcomes through research-led strategy and practical implementation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATS = [
  { value: "200+", label: "AI solutions assessed" },
  { value: "80+", label: "Adoption scenarios" },
  { value: "10+", label: "Countries studied" },
  { value: "400+", label: "Practitioners surveyed" },
];

const PILLARS = [
  {
    title: "Scenario mapping",
    body: "We document real AEC tasks — from feasibility studies to site handover — and record where AI changes the work, and where it demonstrably does not.",
  },
  {
    title: "Tool assessment",
    body: "Structured evaluations of AI tools against discipline-specific criteria: data handling, interoperability, accuracy, procurement risk and total cost.",
  },
  {
    title: "Adoption benchmarking",
    body: "Longitudinal survey work tracking how practices, contractors and developers move from experiment to standard operating procedure.",
  },
];

const STAKEHOLDERS = [
  "Architects",
  "Structural engineers",
  "MEP consultants",
  "Main contractors",
  "Project managers",
  "Developers & asset owners",
  "Quantity surveyors",
  "Public clients",
];

const STEPS = [
  {
    step: "01",
    title: "Diagnose",
    body: "A structured read of your workflows, data maturity and delivery constraints — benchmarked against comparable organisations in our panel.",
  },
  {
    step: "02",
    title: "Prioritise",
    body: "We shortlist the scenarios with defensible value, then match them to tools that survive our assessment criteria.",
  },
  {
    step: "03",
    title: "Pilot",
    body: "Time-boxed pilots with agreed measures, governance guardrails and an honest stop rule when the evidence does not hold.",
  },
  {
    step: "04",
    title: "Embed",
    body: "Capability building, documentation and procurement support so adoption outlives the pilot team.",
  },
];

const RESEARCH = [
  {
    tag: "Working paper",
    date: "March 2026",
    title: "Where generative design actually saved hours: evidence from 42 projects",
  },
  {
    tag: "Benchmark",
    date: "January 2026",
    title: "AEC AI Adoption Index — practice size, data maturity and realised value",
  },
  {
    tag: "Assessment",
    date: "November 2025",
    title: "Automated compliance checking: seven tools tested against building regulations",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="px-6 md:px-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-9 pt-14 pb-16 text-center md:pt-20 md:pb-24">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Research-led AI strategy for the built environment
            </p>
            <h1 className="text-[34px] leading-[1.15] font-extrabold text-primary sm:text-[44px] md:text-[56px]">
              Turn AI potential into
              <br className="hidden sm:block" /> measurable project outcomes
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-foreground md:text-lg">
              AAL Innovation helps architecture, engineering and construction leaders move from AI
              experiments to confident, standards-ready adoption. We pair independent research
              with practical implementation — scenario by scenario, tool by tool — so every
              investment is backed by evidence that holds up on a real project.
            </p>

            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-foreground px-4 py-6 text-center"
                >
                  <span className="text-3xl font-semibold text-primary">{s.value}</span>
                  <span className="text-sm font-semibold text-primary">{s.label}</span>
                </div>
              ))}
            </div>

            <a
              href="#research"
              className="w-full rounded-lg border border-foreground py-5 text-lg text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:text-xl"
            >
              SELECT YOUR ROLE AND TASK
            </a>
          </div>
        </section>

        {/* Research pillars */}
        <section id="research" className="border-t border-hairline px-6 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="max-w-2xl text-2xl font-bold text-primary md:text-4xl">
              Three research programmes, one question: does it hold up on a real project?
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline md:grid-cols-3">
              {PILLARS.map((p) => (
                <article key={p.title} className="bg-background p-8">
                  <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stakeholders */}
        <section
          id="stakeholders"
          className="border-t border-hairline bg-secondary px-6 py-16 md:px-12 md:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <div>
              <h2 className="text-2xl font-bold text-primary md:text-4xl">
                Written for the people delivering the project
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Every scenario in our library is indexed by stakeholder and by lifecycle stage, so
                findings arrive in the language of the discipline that has to act on them.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
              {STAKEHOLDERS.map((s) => (
                <li
                  key={s}
                  className="flex items-center bg-background px-5 py-4 text-sm font-medium text-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Method */}
        <section id="advisory" className="border-t border-hairline px-6 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary md:text-4xl">How an engagement runs</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.step} className="border-t-2 border-primary pt-5">
                  <span className="text-sm font-semibold text-primary">{s.step}</span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest research */}
        <section id="tools" className="border-t border-hairline px-6 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <h2 className="min-w-0 text-2xl font-bold text-primary md:text-4xl">
                Latest publications
              </h2>
              <a
                href="#"
                className="shrink-0 text-sm font-medium text-primary underline underline-offset-4"
              >
                All research
              </a>
            </div>
            <div className="mt-10 divide-y divide-hairline border-y border-hairline">
              {RESEARCH.map((r) => (
                <a
                  key={r.title}
                  href="#"
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-7 transition-colors hover:bg-secondary"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
                      <span className="rounded-sm bg-brand-tint px-2 py-1 font-semibold text-primary">
                        {r.tag}
                      </span>
                      <span>{r.date}</span>
                    </div>
                    <h3 className="mt-3 text-lg leading-snug font-medium text-foreground md:text-xl">
                      {r.title}
                    </h3>
                  </div>
                  <ArrowUpRight className="h-6 w-6 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-hairline bg-primary px-6 py-16 text-primary-foreground md:px-12 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-4xl">
              Bring evidence to your next AI decision
            </h2>
            <p className="mt-4 text-base leading-relaxed opacity-90">
              Tell us the task, the discipline and the constraints. We will point you to the
              scenarios, tools and findings that apply — and say plainly where the evidence is thin.
            </p>
            <a
              href="#"
              className="mt-8 inline-flex items-center justify-center rounded-lg border border-primary-foreground px-8 py-4 text-base font-medium transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              Request a briefing
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
