import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";

export const metadata = { title: "Discover" };

const FILTERS = [
  "Age band",
  "Position",
  "Dominant foot",
  "Height band",
  "Location",
  "Competition level",
  "Verified status",
];

export default function RecruiterDiscovery() {
  return (
    <WorkspaceShell workspace="recruiter" activeHref="/recruiter">
      <h1 className="text-2xl font-semibold text-navy">Discover</h1>

      <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardHeader title="Filters" />
          <CardBody className="space-y-2 text-sm text-navy-600">
            {FILTERS.map((f) => (
              <div
                key={f}
                className="flex items-center justify-between rounded-md bg-navy-50 px-3 py-2"
              >
                {f}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Results" subtitle="Controlled, consent-based access only" />
          <CardBody className="space-y-3 text-sm text-navy-600">
            <div className="flex items-center gap-2">
              <span>Access model</span>
              <StatusBadge status="restricted" />
            </div>
            <ScaffoldNote>
              Recruiters cannot browse the full database. Access to a player portfolio is approved
              by TBA, time-limited and logged; welfare and internal coaching records are never
              included (§5 M10, §5A I, §2).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
