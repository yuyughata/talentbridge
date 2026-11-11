import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata = { title: "Player overview" };

export default function PlayerOverview() {
  return (
    <WorkspaceShell workspace="player" activeHref="/player">
      <h1 className="text-2xl font-semibold text-navy">Overview</h1>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My profile" subtitle="Keep approved information current" />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center justify-between">
              <span>Profile status</span>
              <StatusBadge status="draft" />
            </div>
            <ScaffoldNote>
              Players maintain public, consented fields. Date of birth and documents are restricted
              and never shown on recruiter-facing profiles (§2, §12).
            </ScaffoldNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Consent & privacy" subtitle="You control who can see your profile" />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center justify-between">
              <span>Sharing</span>
              <StatusBadge status="restricted" />
            </div>
            <ScaffoldNote>
              Private by default. Every external share records a lawful basis and consent version
              that can be withdrawn (§5 M03).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
