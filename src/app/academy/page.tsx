import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import { ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata = { title: "Academy overview" };

export default function AcademyOverview() {
  return (
    <WorkspaceShell workspace="academy" activeHref="/academy">
      <h1 className="text-2xl font-semibold text-navy">Academy overview</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <KpiStat label="Players in squad" value="—" />
        <KpiStat label="Sessions this week" value="—" />
        <KpiStat label="Reviews due" value="—" hint="12-week cycle" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Training calendar"
            subtitle="Age-band curricula and weekly microcycles"
          />
          <CardBody className="text-sm text-navy-600">
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
          <CardBody className="text-sm text-navy-600">
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
