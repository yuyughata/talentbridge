import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AssignmentForm } from "@/components/scouting/assignment-form";
import { requireWorkspace } from "@/lib/auth/session";
import { listAllAssignments, listScouts } from "@/lib/assignments/queries";
import { listPlayers } from "@/lib/players/queries";
import { assignmentBadge } from "@/lib/scouting/status";
import { TargetIcon } from "@/components/ui/icons";

export const metadata = { title: "Assignments" };

export default async function AdminAssignmentsPage() {
  const ctx = await requireWorkspace("admin");
  const [assignments, scouts, players] = await Promise.all([
    listAllAssignments(),
    listScouts(),
    listPlayers({ limit: 100 }),
  ]);
  const playerOptions = players.map((p) => ({
    id: p.id,
    name: p.preferred_name || p.display_name,
  }));

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/assignments"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Assignments"
        description="Assign scouts to fixtures and players."
      />

      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        <Card className="h-fit">
          <CardHeader title="New assignment" icon={<TargetIcon />} />
          <CardBody>
            <AssignmentForm scouts={scouts} players={playerOptions} />
            {scouts.length === 0 ? (
              <div className="mt-4">
                <ScaffoldNote>
                  Invite scouts from Users &amp; Roles before assigning work.
                </ScaffoldNote>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="All assignments" subtitle="Most recent 80" />
          <CardBody className="p-0">
            {assignments.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-navy-400">No assignments yet.</p>
            ) : (
              <ul className="divide-y divide-navy-100">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">
                        {a.scout_name ?? "Scout"}
                        {a.player_name
                          ? ` → ${a.player_name}`
                          : a.target_position
                            ? ` → ${a.target_position}`
                            : ""}
                      </p>
                      <p className="truncate text-xs text-navy-400">
                        {a.objective ?? a.match_label ?? "—"}
                        {a.due_date
                          ? ` · due ${new Date(a.due_date).toLocaleDateString("en-GB")}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={assignmentBadge(a.status)} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
