import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RadarChart } from "@/components/scoring/radar-chart";
import { ScoreRing } from "@/components/player/score-ring";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { UserIcon, LockIcon, TargetIcon } from "@/components/ui/icons";
import { DEMO_RADAR } from "@/lib/demo-data";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Player overview" };

export default async function PlayerOverview() {
  const ctx = await requireWorkspace("player");
  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Overview"
        description="Maintain approved information and see your development feedback."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader
            title="My profile"
            subtitle="Keep approved information current"
            icon={<UserIcon />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm text-navy-600">
              <span>Profile status</span>
              <StatusBadge status="draft" />
            </div>
            <div className="flex items-center justify-between text-sm text-navy-600">
              <span>Completeness</span>
              <span className="nums font-semibold text-navy">62%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-navy-50">
              <div className="h-full rounded-full bg-teal-sheen" style={{ width: "62%" }} />
            </div>
            <ScaffoldNote>
              Players maintain public, consented fields. Date of birth and documents are restricted
              and never shown on recruiter-facing profiles.
            </ScaffoldNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="My latest assessment"
            subtitle="Shown with date and assessor"
            icon={<TargetIcon />}
          />
          <CardBody>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <ScoreRing value={74} size={88} />
              <RadarChart axes={DEMO_RADAR} size={220} />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5">
        <Card>
          <CardHeader
            title="Consent & privacy"
            subtitle="You control who can see your profile"
            icon={<LockIcon />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm text-navy-600">
              <span>Sharing</span>
              <StatusBadge status="restricted" />
            </div>
            <ScaffoldNote>
              Private by default. Every external share records a lawful basis and consent version
              that can be withdrawn.
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
