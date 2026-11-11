import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listMyAssignments } from "@/lib/assignments/queries";
import { updateAssignmentStatus } from "@/lib/assignments/actions";
import { assignmentBadge } from "@/lib/scouting/status";

export const metadata = { title: "Assignments" };

export default async function ScoutAssignmentsPage() {
  const ctx = await requireWorkspace("scout");
  const assignments = await listMyAssignments(ctx.userId);

  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/assignments"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Assignments"
        description="Fixtures and players you've been assigned to scout."
      />

      {assignments.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            No assignments yet. TBA will assign fixtures and players here.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const reportHref = `/scout/reports/new?assignmentId=${a.id}${a.target_player_id ? `&playerId=${a.target_player_id}` : ""}`;
            return (
              <Card key={a.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy">
                        {a.player_name ??
                          a.target_position ??
                          a.match_label ??
                          "Scouting assignment"}
                      </p>
                      <StatusBadge status={assignmentBadge(a.status)} />
                    </div>
                    <p className="mt-0.5 text-sm text-navy-500">{a.objective ?? "—"}</p>
                    <p className="mt-0.5 text-xs text-navy-400">
                      {a.match_label ? `${a.match_label} · ` : ""}
                      {a.due_date
                        ? `Due ${new Date(a.due_date).toLocaleDateString("en-GB")}`
                        : "No due date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === "open" ? (
                      <form action={updateAssignmentStatus.bind(null, a.id, "in_progress")}>
                        <Button type="submit" size="sm" variant="outline">
                          Start
                        </Button>
                      </form>
                    ) : null}
                    <Link href={reportHref}>
                      <Button size="sm">Start report</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}
