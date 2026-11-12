import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listCurricula } from "@/lib/training/queries";
import { CalendarIcon } from "@/components/ui/icons";

export const metadata = { title: "Player Development" };

const BAND_LABEL: Record<string, string> = {
  u6_9: "6–9 Foundation",
  u10_12: "10–12 Development",
  u13_15: "13–15 Advanced foundation",
  u16_18: "16–18 Performance prep",
  u19_23: "19–23 Senior",
};

export default async function AcademyDevelopmentPage() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const curricula = await listCurricula(academy?.organisationId);

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/development"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Player Development"
        description="Age-band pathways and individual development plans (§5A A/D)."
      />

      <Card className="mb-6">
        <CardBody>
          <ScaffoldNote>
            Individual development plans are managed per player. Open a player from the{" "}
            <Link href="/academy/squad" className="font-medium text-amber-700 hover:text-amber-800">
              squad
            </Link>{" "}
            and use <span className="font-medium">Development → Manage</span>. Age bands below are
            planning guides, adapted to maturity, school and recovery — not rigid prescriptions.
          </ScaffoldNote>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Age-band curricula"
          subtitle="Editable templates (§5A A)"
          icon={<CalendarIcon />}
        />
        <CardBody className="p-0">
          {curricula.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-navy-400">
              No curriculum templates found.
            </p>
          ) : (
            <ul className="divide-y divide-navy-100">
              {curricula.map((c) => (
                <li key={c.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-600">
                      {BAND_LABEL[c.age_band] ?? c.age_band}
                    </span>
                    <span className="text-sm font-medium text-navy">{c.name}</span>
                  </div>
                  {c.focus_summary ? (
                    <p className="mt-1 text-sm text-navy-500">{c.focus_summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </WorkspaceShell>
  );
}
