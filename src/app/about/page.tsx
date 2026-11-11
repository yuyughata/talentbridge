import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PitchLines } from "@/components/brand/pitch";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
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
    <main className="bg-canvas">
      <header className="sticky top-0 z-30 border-b border-navy-100/70 bg-canvas/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm font-medium text-navy-500 hover:text-navy">
            Home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy-depth text-white">
        <PitchLines className="pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[620px] -translate-y-1/2 text-white/[0.06]" />
        <div className="container-page relative py-16 md:py-20">
          <p className="eyebrow text-teal-200">The approach</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tightest text-white md:text-5xl">
            What Talent Bridge Africa is — and isn&apos;t.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-100/90">
            TBA is a trusted football data and workflow system first. It supports — it does not
            replace — licensed agents, clubs and federation processes. Scores are structured
            professional opinions, not guarantees of future performance or placement.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Card key={a.id} className="scroll-mt-24">
              <div id={a.id} />
              <CardBody>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <a.icon />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-navy">{a.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{a.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-navy-100 bg-surface-muted/50">
        <div className="container-page py-16">
          <p className="eyebrow">Product language</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy">
            We describe evidence and dates — never guarantees.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {PREFER.map((row) => (
              <div key={row.good} className="rounded-xl2 border border-navy-100 bg-surface p-4">
                <p className="flex items-start gap-2 text-sm text-navy">
                  <span className="mt-0.5 text-teal-600">✓</span> {row.good}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-navy-400 line-through decoration-risk/40">
                  <span className="mt-0.5 text-risk">✕</span> {row.bad}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-100 bg-surface">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-navy-500 md:flex-row md:items-center md:justify-between">
          <Logo />
          <Link href="/" className="hover:text-navy">
            Back to home
          </Link>
        </div>
      </footer>
    </main>
  );
}
