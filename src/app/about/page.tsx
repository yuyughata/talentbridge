import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = { title: "About" };

const AUDIENCES = [
  {
    id: "players",
    title: "For Players",
    body: "Create a credible profile, control your consent and media, and see clear development priorities and feedback.",
  },
  {
    id: "academies",
    title: "For Academies",
    body: "Maintain player records, plan age-appropriate training, record attendance and development, and collaborate with TBA.",
  },
  {
    id: "clubs",
    title: "For Clubs & Recruiters",
    body: "Find relevant, well-documented players through controlled, consent-based access — not an open marketplace.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <header className="border-b border-navy-100 bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm font-medium text-navy-600 hover:text-navy">
            Home
          </Link>
        </div>
      </header>

      <section className="container-page py-14">
        <h1 className="text-3xl font-bold text-navy">
          What Talent Bridge Africa is — and isn&apos;t
        </h1>
        <p className="mt-4 max-w-2xl text-navy-600">
          TBA is a trusted football data and workflow system first. It supports — it does not
          replace — licensed agents, clubs and federation processes. Scores are structured
          professional opinions, not guarantees of future performance or placement.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Card key={a.id} className="scroll-mt-24">
              <div id={a.id} />
              <CardHeader title={a.title} />
              <CardBody className="text-sm text-navy-600">{a.body}</CardBody>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
