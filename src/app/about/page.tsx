import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PitchLines } from "@/components/brand/pitch";
import { Reveal } from "@/components/home/parallax";
import { BallIcon, UsersIcon, SearchIcon } from "@/components/ui/icons";

export const metadata = { title: "About" };

const AUDIENCES = [
  {
    id: "players",
    title: "For Players",
    icon: BallIcon,
    body: "Create a credible profile, control your consent and media, and see clear development priorities and feedback.",
  },
  {
    id: "academies",
    title: "For Academies",
    icon: UsersIcon,
    body: "Maintain player records, plan age-appropriate training, record attendance and development, and collaborate with TBA.",
  },
  {
    id: "clubs",
    title: "For Clubs & Recruiters",
    icon: SearchIcon,
    body: "Find relevant, well-documented players through controlled, consent-based access — not an open marketplace.",
  },
];

const PREFER = [
  { good: "Assessed by TBA scout on [date]", bad: "TBA-certified world-class prospect" },
  { good: "Identity evidence reviewed", bad: "FIFA verified player" },
  { good: "Potential fit for further evaluation", bad: "Guaranteed European placement" },
  { good: "Assessment score / scout opinion", bad: "Objective talent score" },
];

export default function AboutPage() {
  return (
    <main className="bg-ink-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/">
            <Logo dark />
          </Link>
          <Link href="/" className="text-sm font-medium text-white/60 hover:text-white">
            Home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink-depth">
        <PitchLines className="pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[620px] -translate-y-1/2 text-white/[0.06]" />
        <div className="pitch-lines absolute inset-0 opacity-30" />
        <div className="container-page relative py-20 md:py-24">
          <p className="eyebrow text-teal-300">The approach</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tightest text-white md:text-6xl">
            What Talent Bridge Africa is — and isn&apos;t.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/65">
            TBA is a trusted football data and workflow system first. It supports — it does not
            replace — licensed agents, clubs and federation processes. Scores are structured
            professional opinions, not guarantees of future performance or placement.
          </p>
        </div>
      </section>

      <section className="bg-ink-950 py-20">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.id} delay={i * 90}>
              <div
                id={a.id}
                className="h-full scroll-mt-24 rounded-xl2 border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                  <a.icon />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-white">{a.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-ink-900 py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Product language</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              We describe evidence and dates — never guarantees.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {PREFER.map((row, i) => (
              <Reveal key={row.good} delay={i * 70}>
                <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-4">
                  <p className="flex items-start gap-2 text-sm text-white">
                    <span className="mt-0.5 text-teal-300">✓</span> {row.good}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-white/40 line-through decoration-risk/50">
                    <span className="mt-0.5 text-risk-500">✕</span> {row.bad}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink-950">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <Logo dark />
          <Link href="/" className="hover:text-white">
            Back to home
          </Link>
        </div>
      </footer>
    </main>
  );
}
