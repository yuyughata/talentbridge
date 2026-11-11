import { KpiStat } from "@/components/ui/kpi-stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { BarList } from "@/components/analytics/bar-list";
import { requireWorkspace } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/analytics/queries";
import { UsersIcon, ClipboardIcon, ChartIcon, CalendarIcon } from "@/components/ui/icons";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const ctx = await requireWorkspace("admin");
  const a = await getAnalytics();

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/analytics"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Analytics"
        description="Reporting across coverage, completion and engagement (§5 M12)."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="Players" value={a.totals.players} icon={<UsersIcon />} />
        <KpiStat
          label="Reports"
          value={a.totals.reports}
          icon={<ClipboardIcon />}
          hint={`${a.totals.approvedReports} approved`}
        />
        <KpiStat
          label="Avg. profile completeness"
          value={`${a.avgCompleteness}%`}
          icon={<ChartIcon />}
        />
        <KpiStat
          label="Training sessions"
          value={a.sessions}
          icon={<CalendarIcon />}
          hint={`${a.totals.academies} academies`}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Position distribution" subtitle="Players by primary position" />
          <CardBody>
            <BarList data={a.positionDistribution} empty="No players yet." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Report pipeline" subtitle="Scouting reports by status" />
          <CardBody>
            <BarList data={a.reportStatus} empty="No reports yet." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Evidence-backed reports"
            subtitle="Reports in review with recorded strengths (§13 target ≥90%)"
          />
          <CardBody>
            <div className="flex items-end gap-3">
              <span className="nums text-4xl font-semibold text-navy">{a.evidenceRate}%</span>
              <span className="pb-1 text-sm text-navy-400">of submitted / approved reports</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-navy-50">
              <div
                className="h-full rounded-full bg-teal-sheen"
                style={{ width: `${a.evidenceRate}%` }}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recruiter enquiries" subtitle="By status (§5 M10)" />
          <CardBody>
            <BarList data={a.enquiryStatus} empty="No enquiries yet." />
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
