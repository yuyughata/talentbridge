import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const WORKSPACES = [
  {
    href: "/player",
    name: "Player portal",
    blurb: "Maintain your profile, media and consent; see development feedback.",
  },
  {
    href: "/scout",
    name: "Scout workspace",
    blurb: "Structured, auditable field scouting reports and scorecards.",
  },
  {
    href: "/academy",
    name: "Academy workspace",
    blurb: "Squads, training calendar, attendance and development plans.",
  },
  {
    href: "/recruiter",
    name: "Recruiter workspace",
    blurb: "Controlled, consent-based discovery of well-documented players.",
  },
  {
    href: "/admin",
    name: "TBA operations",
    blurb: "Verification, review queue, partnerships, users, audit.",
  },
];

const PRINCIPLES = [
  "Reliable player identity, age and playing-history records with verification status.",
  "Scouting reports that distinguish observed evidence from opinion.",
  "Development tracked over time rather than one-off ratings.",
  "Controlled, consent-based sharing of player profiles and media.",
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-navy-100 bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-navy-600 md:flex">
            <Link href="/about" className="hover:text-navy">
              About
            </Link>
            <Link href="/about#players" className="hover:text-navy">
              For Players
            </Link>
            <Link href="/about#academies" className="hover:text-navy">
              For Academies
            </Link>
            <Link href="/about#clubs" className="hover:text-navy">
              For Clubs
            </Link>
          </nav>
          <Link href="/player">
            <Button variant="primary">Sign in</Button>
          </Link>
        </div>
      </header>

      <section className="bg-navy text-white">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-100">
              Product strategy · Scouting · Development
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              A trusted football data and development system for African talent.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-50/90">
              Talent Bridge Africa gives organisations, academies and authorised scouts a consistent
              way to identify players, capture evidence, assess performance and prepare credible
              portfolios — not a public transfer marketplace, and not an automated promise of
              placement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about">
                <Button variant="primary">How it works</Button>
              </Link>
              <Link href="/scout">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Explore the workspaces
                </Button>
              </Link>
            </div>
          </div>
          <Card className="bg-surface">
            <CardBody>
              <h2 className="text-base font-semibold text-navy">What the platform guarantees</h2>
              <ul className="mt-3 space-y-3">
                {PRINCIPLES.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-navy-600">
                    <span aria-hidden className="mt-1 h-2 w-2 flex-none rounded-full bg-teal" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold text-navy">Workspaces</h2>
        <p className="mt-2 max-w-2xl text-navy-600">
          Each role gets a focused workspace. Access to sensitive player data is controlled,
          consent-based and logged.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKSPACES.map((w) => (
            <Link key={w.href} href={w.href} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <h3 className="text-base font-semibold text-navy">{w.name}</h3>
                  <p className="mt-1 text-sm text-navy-600">{w.blurb}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-navy-100 bg-surface">
        <div className="container-page flex flex-col gap-2 py-8 text-sm text-navy-600 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>Private by default · Consent-based sharing · Human review before verification.</p>
        </div>
      </footer>
    </main>
  );
}
