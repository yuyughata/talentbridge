import { KpiStat } from "@/components/ui/kpi-stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata = { title: "Command Centre" };

export default function AdminDashboard() {
  return (
    <WorkspaceShell workspace="admin" activeHref="/admin">
      <h1 className="text-2xl font-semibold text-navy">Command Centre</h1>

      {/* Top KPI strip (§4 Operations dashboard). Values are placeholders until wired to queries. */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="New profiles (7d)" value="—" hint="Pending completeness check" />
        <KpiStat label="Reports due" value="—" hint="Across active assignments" />
        <KpiStat label="Verification queue" value="—" hint="Identity / age evidence" />
        <KpiStat label="Active academies" value="—" hint="Partner engagement" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Review queue"
            subtitle="Submitted scouting reports awaiting a reviewer"
          />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center justify-between">
              <span>Report pipeline</span>
              <span className="flex gap-2">
                <StatusBadge status="submitted" />
                <StatusBadge status="under_review" />
                <StatusBadge status="approved" />
              </span>
            </div>
            <ScaffoldNote>
              Wire to <code>scouting_reports</code> filtered by status. Approval updates assessment
              history but never auto-verifies the player (§9).
            </ScaffoldNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Verification"
            subtitle="Human review before a player is marked verified"
          />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center justify-between">
              <span>Evidence states</span>
              <span className="flex gap-2">
                <StatusBadge status="needs_evidence" />
                <StatusBadge status="verified" />
              </span>
            </div>
            <ScaffoldNote>
              Restricted to designated verification staff. Documents stay in private storage with
              short-lived signed URLs (§7, §12).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
