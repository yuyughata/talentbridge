import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScorecardModelPreview } from "@/components/scoring/scorecard-model-preview";
import { ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata = { title: "Scout dashboard" };

export default function ScoutDashboard() {
  return (
    <WorkspaceShell workspace="scout" activeHref="/scout">
      <h1 className="text-2xl font-semibold text-navy">Scout dashboard</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <KpiStat label="Open assignments" value="—" />
        <KpiStat label="Reports in draft" value="—" />
        <KpiStat label="Returned for clarification" value="—" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent submissions"
            subtitle="Field reports move through a review queue"
          />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center gap-2">
              <StatusBadge status="draft" />
              <StatusBadge status="submitted" />
              <StatusBadge status="needs_evidence" />
            </div>
            <ScaffoldNote>
              The mobile scouting report captures all seven weighted categories plus Speed
              sub-scores, with save-as-draft (§4, §10 acceptance criteria).
            </ScaffoldNote>
          </CardBody>
        </Card>

        <ScorecardModelPreview />
      </div>
    </WorkspaceShell>
  );
}
