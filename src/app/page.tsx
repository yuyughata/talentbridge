import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PitchLines } from "@/components/brand/pitch";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PlayerCard } from "@/components/player/player-card";
import { RadarChart } from "@/components/scoring/radar-chart";
import { DEMO_PLAYERS, DEMO_RADAR } from "@/lib/demo-data";
import {
  BallIcon,
  ChartIcon,
  ClipboardIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

const WORKSPACES = [
  {
    href: "/player",
    name: "Player portal",
    icon: BallIcon,
    blurb: "Maintain your profile, media and consent; see development feedback.",
  },
  {
    href: "/scout",
    name: "Scout workspace",
    icon: ClipboardIcon,
    blurb: "Fast, structured, auditable field scouting reports and scorecards.",
  },
  {
    href: "/academy",
    name: "Academy workspace",
    icon: UsersIcon,
    blurb: "Squads, training calendar, attendance and development plans.",
  },
  {
    href: "/recruiter",
    name: "Recruiter workspace",
    icon: SearchIcon,
    blurb: "Controlled, consent-based discovery of well-documented players.",
  },
  {
    href: "/admin",
    name: "TBA operations",
    icon: ShieldIcon,
    blurb: "Verification, review queue, partnerships, users and audit.",
  },
];

const PILLARS = [
  {
    icon: ClipboardIcon,
    title: "Evidence, not opinion",
    body: "Every scouting report separates what was observed from what was inferred, with assessor confidence and match context.",
  },
  {
    icon: ChartIcon,
    title: "Development over time",
    body: "Track progress across 12-week cycles and trends — not a single headline rating that goes stale.",
  },
  {
    icon: LockIcon,
    title: "Private by default",
    body: "Date of birth, documents and welfare notes stay restricted. Every external share records a lawful basis and consent.",
  },
  {
    icon: ShieldIcon,
    title: "Human review built in",
    body: "No automated path marks a player verified or shares them. Recruiter access is approved, time-limited and logged.",
  },
];

export default function HomePage() {
  const hero = DEMO_PLAYERS[0]!;

  return (
    <main className="bg-canvas">
      <header className="sticky top-0 z-30 border-b border-navy-100/70 bg-canvas/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-navy-500 md:flex">
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
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-depth text-white">
        <PitchLines className="pointer-events-none absolute -right-20 top-1/2 h-[520px] w-[720px] -translate-y-1/2 text-white/[0.06]" />
        <div className="pitch-lines absolute inset-0 opacity-40" />
        <div className="container-page relative grid gap-12 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-28">
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-100">
              <BallIcon className="h-3.5 w-3.5" /> Football talent intelligence · Nigeria-first
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tightest text-white md:text-6xl">
              Scout smarter.
              <br />
              Develop <span className="text-teal-300">with evidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100/90">
              Talent Bridge Africa gives organisations, academies and authorised scouts a consistent
              way to identify players, capture evidence, assess performance and prepare credible
              portfolios — not a public marketplace, and not a promise of placement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/scout">
                <Button size="lg">
                  Explore the workspaces <ArrowUpRightIcon className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  How it works
                </Button>
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "7", v: "weighted attributes" },
                { k: "15%", v: "Speed as its own score" },
                { k: "100%", v: "shares with consent" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="nums text-3xl font-semibold text-white">{s.k}</dt>
                  <dd className="mt-1 text-xs text-navy-100/80">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* floating player card + radar */}
          <div className="relative mx-auto w-full max-w-sm animate-fade-in">
            <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full bg-teal/30 blur-2xl sm:block" />
            <PlayerCard player={hero} className="relative shadow-lift" />
            <Card className="relative -mt-4 ml-6 w-[82%] bg-surface">
              <CardBody className="pb-2 pt-3">
                <p className="eyebrow">Attribute profile</p>
                <RadarChart axes={DEMO_RADAR} size={240} />
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Built on trust</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy">
            A football data system first — not a transfer marketplace.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <Card key={p.title} className="h-full">
              <CardBody>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <p.icon />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{p.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Talent pool showcase */}
      <section className="border-y border-navy-100 bg-surface-muted/60">
        <div className="container-page py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Talent pool</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy">
                Credible profiles, not hype.
              </h2>
            </div>
            <Link
              href="/recruiter"
              className="hidden items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 sm:inline-flex"
            >
              See recruiter view <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {DEMO_PLAYERS.map((p) => (
              <PlayerCard key={p.name} player={p} />
            ))}
          </div>
          <p className="mt-6 text-xs text-navy-400">
            Illustrative profiles. A weighted index is a screening aid, read alongside position,
            competition level, age and number of observations — never a guarantee.
          </p>
        </div>
      </section>

      {/* Workspaces */}
      <section className="container-page py-20">
        <p className="eyebrow">One platform, five workspaces</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-navy">
          Every role gets a focused, intuitive workspace.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKSPACES.map((w) => (
            <Link key={w.href} href={w.href} className="group block">
              <Card interactive className="h-full">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                      <w.icon />
                    </span>
                    <ArrowUpRightIcon className="h-5 w-5 text-navy-300 transition-colors group-hover:text-teal-600" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy">{w.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-500">{w.blurb}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-xl2 bg-navy-depth px-8 py-12 text-white md:px-14 md:py-16">
          <PitchLines className="pointer-events-none absolute -right-10 top-0 h-full w-[460px] text-white/[0.06]" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Ready to build credible pathways for African talent.
            </h2>
            <p className="mt-3 text-navy-100/90">
              The platform supports — it does not replace — licensed agents, clubs and federation
              processes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/about">
                <Button size="lg">Read the approach</Button>
              </Link>
              <Link href="/scout">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  Open a workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-100 bg-surface">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-navy-500 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>Private by default · Consent-based sharing · Human review before verification.</p>
        </div>
      </footer>
    </main>
  );
}
