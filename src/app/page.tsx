import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PitchLines } from "@/components/brand/pitch";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/player/player-card";
import { RadarChart } from "@/components/scoring/radar-chart";
import { ParallaxLayer, Reveal } from "@/components/home/parallax";
import { DEMO_PLAYERS, DEMO_RADAR } from "@/lib/demo-data";
import {
  BallIcon,
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  TargetIcon,
  UsersIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

const DEV_STEPS = [
  {
    icon: CalendarIcon,
    title: "Age-band pathways",
    body: "Editable curricula for every age band, adapted to maturity, school and recovery — not rigid prescriptions.",
  },
  {
    icon: TargetIcon,
    title: "12-week cycles",
    body: "Baseline, train, apply, reassess. Individual development plans with measurable goals and review dates.",
  },
  {
    icon: ChartIcon,
    title: "Progress over time",
    body: "Trends across technical, tactical, speed and decision-making — never a single headline score.",
  },
];

const PILLARS = [
  {
    icon: ClipboardIcon,
    title: "Evidence, not opinion",
    body: "Reports separate what was observed from what was inferred, with assessor confidence and match context.",
  },
  {
    icon: LockIcon,
    title: "Private by default",
    body: "Date of birth, documents and welfare notes stay restricted. Every share records a lawful basis and consent.",
  },
  {
    icon: ShieldIcon,
    title: "Human review built in",
    body: "No automated path marks a player verified or shares them. Recruiter access is approved, time-limited and logged.",
  },
];

const WORKSPACES = [
  {
    href: "/player",
    name: "Player portal",
    icon: BallIcon,
    blurb: "Profile, media and consent; see development feedback.",
  },
  {
    href: "/scout",
    name: "Scout workspace",
    icon: ClipboardIcon,
    blurb: "Fast, structured, auditable field scouting.",
  },
  {
    href: "/academy",
    name: "Academy workspace",
    icon: UsersIcon,
    blurb: "Squads, training calendar, attendance, development.",
  },
  {
    href: "/recruiter",
    name: "Recruiter workspace",
    icon: SearchIcon,
    blurb: "Consent-based discovery of documented players.",
  },
  {
    href: "/admin",
    name: "TBA operations",
    icon: ShieldIcon,
    blurb: "Verification, review queue, partnerships, audit.",
  },
];

export default function HomePage() {
  const hero = DEMO_PLAYERS[0]!;

  return (
    <main className="bg-ink-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo dark />
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/about#players" className="hover:text-white">
              For Players
            </Link>
            <Link href="/about#academies" className="hover:text-white">
              For Academies
            </Link>
            <Link href="/about#clubs" className="hover:text-white">
              For Clubs
            </Link>
          </nav>
          <Link href="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* ---- Hero (parallax) ---- */}
      <section className="relative overflow-hidden bg-ink-depth">
        {/* parallax decorative layers */}
        <ParallaxLayer speed={0.18} className="pointer-events-none absolute inset-0">
          <div className="pitch-lines absolute inset-0 opacity-[0.35]" />
        </ParallaxLayer>
        <ParallaxLayer speed={0.32} className="pointer-events-none absolute inset-0">
          <PitchLines className="absolute -right-24 top-24 h-[560px] w-[760px] text-white/[0.05]" />
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal/25 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-amber/10 blur-[120px]" />
        </ParallaxLayer>

        <div className="container-page relative grid gap-12 py-24 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-32">
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-200">
              <BallIcon className="h-3.5 w-3.5" /> A talent development operating system ·
              Nigeria-first
            </span>
            {/* Development-led headline, then the scouting idea. */}
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tightest text-white md:text-7xl">
              Develop the talent.
              <span className="mt-2 block bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                Then scout smarter.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/65">
              Talent Bridge Africa helps academies plan age-appropriate training, track development
              over time, and turn that evidence into credible scouting and portfolios — not a public
              marketplace, and not a promise of placement.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/academy">
                <Button size="lg">
                  Start developing players <ArrowUpRightIcon className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  How it works
                </Button>
              </Link>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "12-wk", v: "development cycles" },
                { k: "7", v: "weighted attributes" },
                { k: "100%", v: "shares with consent" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="nums text-3xl font-semibold text-white">{s.k}</dt>
                  <dd className="mt-1 text-xs text-white/50">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* floating cards with gentle counter-parallax */}
          <ParallaxLayer speed={-0.07} className="relative mx-auto w-full max-w-sm">
            <div className="absolute -left-8 -top-8 hidden h-28 w-28 rounded-full bg-teal/40 blur-3xl sm:block" />
            <PlayerCard player={hero} className="relative shadow-lift" />
            <div className="relative -mt-4 ml-8 w-[82%] rounded-xl2 border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="eyebrow">Attribute profile</p>
              <RadarChart axes={DEMO_RADAR} size={230} />
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ---- Development first ---- */}
      <section className="relative border-t border-white/5 bg-ink-950 py-24">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Development first</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A complete talent development operating system.
            </h2>
            <p className="mt-4 text-white/60">
              Coaches plan, deliver and record training; players grow against measurable goals. The
              scouting and recruitment tools sit on top of that evidence — development comes first.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {DEV_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="group h-full rounded-xl2 border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-teal-500/40 hover:bg-white/[0.05]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                    <s.icon />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Trust pillars ---- */}
      <section className="bg-ink-900 py-24">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Built on trust</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A football data system first — not a transfer marketplace.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="h-full rounded-xl2 border border-white/10 bg-white/[0.03] p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-teal-300">
                    <p.icon />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Talent pool showcase ---- */}
      <section className="relative overflow-hidden bg-ink-950 py-24">
        <PitchLines className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 text-white/[0.04]" />
        <div className="container-page relative">
          <Reveal className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Talent pool</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Credible profiles, not hype.
              </h2>
            </div>
            <Link
              href="/recruiter"
              className="hidden items-center gap-1 text-sm font-medium text-teal-300 hover:text-teal-200 sm:inline-flex"
            >
              See recruiter view <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {DEMO_PLAYERS.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
                <PlayerCard player={p} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/35">
            Illustrative profiles. A weighted index is a screening aid, read alongside position,
            competition level, age and number of observations — never a guarantee.
          </p>
        </div>
      </section>

      {/* ---- Workspaces ---- */}
      <section className="bg-ink-900 py-24">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">One platform, five workspaces</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Every role gets a focused, intuitive workspace.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSPACES.map((w, i) => (
              <Reveal key={w.href} delay={i * 70}>
                <Link href={w.href} className="group block h-full">
                  <div className="h-full rounded-xl2 border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-sheen text-white">
                        <w.icon />
                      </span>
                      <ArrowUpRightIcon className="h-5 w-5 text-white/30 transition-colors group-hover:text-teal-300" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-white">{w.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{w.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-ink-950 pb-24 pt-4">
        <div className="container-page">
          <Reveal className="relative overflow-hidden rounded-xl2 border border-white/10 bg-ink-depth px-8 py-14 md:px-14 md:py-16">
            <PitchLines className="pointer-events-none absolute -right-10 top-0 h-full w-[460px] text-white/[0.06]" />
            <div className="relative max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Build credible pathways for African talent.
              </h2>
              <p className="mt-3 text-white/65">
                The platform supports — it does not replace — licensed agents, clubs and federation
                processes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about">
                  <Button size="lg">Read the approach</Button>
                </Link>
                <Link href="/academy">
                  <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                    Open a workspace
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink-950">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <Logo dark />
          <p>Private by default · Consent-based sharing · Human review before verification.</p>
        </div>
      </footer>
    </main>
  );
}
