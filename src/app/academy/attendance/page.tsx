import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listSessions } from "@/lib/training/queries";

export const metadata = { title: "Attendance" };

const SESSION_BADGE: Record<string, StatusKind> = {
  planned: "submitted",
  delivered: "approved",
  cancelled: "rejected",
};

export default async function AttendancePage() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const sessions = academy ? await listSessions(academy.organisationId) : [];

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/attendance"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Attendance"
        description="Open a session to record attendance and observations (§5A E)."
      />
      {sessions.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            No sessions yet. Plan one in the Training Calendar.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-navy-100">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/academy/sessions/${s.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-navy-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">{s.title}</p>
                    <p className="text-xs text-navy-400">
                      {s.scheduled_at
                        ? new Date(s.scheduled_at).toLocaleDateString("en-GB")
                        : "Unscheduled"}
                    </p>
                  </div>
                  <StatusBadge status={SESSION_BADGE[s.status] ?? "draft"} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
