import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { UsersIcon, CalendarIcon, TargetIcon } from "@/components/ui/icons";
import { requireWorkspace } from "@/lib/auth/session";
import { academyKpis } from "@/lib/dashboard/queries";

export const metadata = { title: "Academy overview" };

const WEEK = [
  { day: "Mon", focus: "Recovery / mobility", tone: "bg-navy-50 text-navy-500" },
  { day: "Tue", focus: "Technical & passing", tone: "bg-teal-50 text-lime-700" },
  { day: "Wed", focus: "Speed / agility", tone: "bg-amber-50 text-amber-700" },
  { day: "Thu", focus: "Tactical / SSG", tone: "bg-teal-50 text-lime-700" },
  { day: "Fri", focus: "Position-specific", tone: "bg-teal-50 text-lime-700" },
  { day: "Sat", focus: "Match", tone: "bg-navy text-white" },
  { day: "Sun", focus: "Rest", tone: "bg-navy-50 text-navy-400" },
];

export default async function AcademyOverview() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const kpis = academy
    ? await academyKpis(academy.organisationId)
    : { squadSize: 0, sessionsThisWeek: 0, reviewsDue: 0 };
  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Academy overview"
        description="Maintain records and collaborate with TBA."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiStat label="Players in squad" value={kpis.squadSize} icon={<UsersIcon />} />
        <KpiStat label="Sessions this week" value={kpis.sessionsThisWeek} icon={<CalendarIcon />} />
        <KpiStat
          label="Reviews due"
          value={kpis.reviewsDue}
          icon={<TargetIcon />}
          hint="12-week cycle"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="This week's microcycle"
            subtitle="Age band 13–15 · editable template, not a fixed schedule (§5A B)"
            icon={<CalendarIcon />}
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {WEEK.map((d) => (
                <div key={d.day} className="rounded-lg border border-navy-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                    {d.day}
                  </p>
                  <p
                    className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-medium ${d.tone}`}
                  >
                    {d.focus}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Training calendar"
            subtitle="Age-band curricula and weekly microcycles"
          />
          <CardBody>
            <ScaffoldNote>
              Session templates are editable, not hard-coded. Age bands are planning guides adapted
              to maturity, schedule and recovery (§5A A/B).
            </ScaffoldNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Player development"
            subtitle="Individual development plans and trends"
          />
          <CardBody>
            <ScaffoldNote>
              Show progress over time, not a single headline score. Welfare notes stay restricted
              and are never shared with recruiters (§5A G/H/I).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
