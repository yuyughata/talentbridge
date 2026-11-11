import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScorecardModelPreview } from "@/components/scoring/scorecard-model-preview";
import { RadarChart } from "@/components/scoring/radar-chart";
import { ScoreRing } from "@/components/player/score-ring";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { TargetIcon, ClipboardIcon, WhistleIcon } from "@/components/ui/icons";
import { DEMO_PLAYERS, DEMO_RADAR } from "@/lib/demo-data";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Scout dashboard" };

export default async function ScoutDashboard() {
  const ctx = await requireWorkspace("scout");
  const focus = DEMO_PLAYERS[0]!;

  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Scout dashboard"
        description="Make field scouting fast, structured and auditable."
        action={
          <Button size="sm">
            <ClipboardIcon className="h-4 w-4" /> New report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiStat label="Open assignments" value="5" icon={<TargetIcon />} hint="2 due this week" />
        <KpiStat label="Reports in draft" value="3" icon={<ClipboardIcon />} />
        <KpiStat label="Returned for clarification" value="1" icon={<WhistleIcon />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Player in focus with radar */}
        <Card>
          <CardHeader title="Player in focus" subtitle={`${focus.name} · ${focus.position}`} />
          <CardBody>
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing value={focus.score ?? 0} size={96} label="Index" />
                <StatusBadge status={focus.verification} />
                <span className="text-xs text-navy-400">{focus.observations} observations</span>
              </div>
              <RadarChart axes={DEMO_RADAR} size={260} />
            </div>
            <p className="mt-3 text-xs text-navy-400">
              A weighted index is a screening aid, read alongside position, competition level, age
              and number of observations (§6).
            </p>
          </CardBody>
        </Card>

        <ScorecardModelPreview />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent submissions"
            subtitle="Field reports move through a review queue"
            icon={<ClipboardIcon />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge status="draft" />
              <StatusBadge status="submitted" />
              <StatusBadge status="needs_evidence" />
              <StatusBadge status="approved" />
            </div>
            <ScaffoldNote>
              The mobile scouting report captures all seven weighted categories plus Speed
              sub-scores, with save-as-draft (§4, §10 acceptance criteria).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
