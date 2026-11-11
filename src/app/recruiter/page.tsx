import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayersGrid } from "@/components/players/players-grid";
import { SearchIcon, LockIcon } from "@/components/ui/icons";
import { requireWorkspace } from "@/lib/auth/session";
import { listPlayers } from "@/lib/players/queries";

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

export default async function RecruiterDiscovery() {
  const ctx = await requireWorkspace("recruiter");
  const players = await listPlayers({ limit: 60 });
  return (
    <WorkspaceShell
      workspace="recruiter"
      activeHref="/recruiter"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Discover"
        description="Controlled, consent-based access to relevant talent."
      />

      <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Filters" icon={<SearchIcon />} />
          <CardBody className="space-y-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 transition-colors hover:border-navy-200 hover:bg-navy-50"
              >
                {f}
                <span className="text-navy-300">+</span>
              </button>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Access model"
              subtitle="No unrestricted browse of the database"
              icon={<LockIcon />}
            />
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <span>Portfolio access</span>
                <StatusBadge status="restricted" />
              </div>
              <ScaffoldNote>
                Access to a player portfolio is approved by TBA, time-limited and logged. Welfare
                and internal coaching records are never included (§5 M10, §5A I, §2).
              </ScaffoldNote>
            </CardBody>
          </Card>

          <PlayersGrid players={players} />
        </div>
      </div>
    </WorkspaceShell>
  );
}
