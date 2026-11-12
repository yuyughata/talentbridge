import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { SessionForm } from "@/components/training/session-form";
import { requireWorkspace } from "@/lib/auth/session";
import { listSessions } from "@/lib/training/queries";
import { CalendarIcon } from "@/components/ui/icons";

export const metadata = { title: "Training Calendar" };

const SESSION_BADGE: Record<string, StatusKind> = {
  planned: "submitted",
  delivered: "approved",
  cancelled: "rejected",
};

export default async function CalendarPage() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const sessions = academy ? await listSessions(academy.organisationId) : [];

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/calendar"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Training Calendar"
        description="Plan and deliver sessions. Templates are editable, not fixed."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader title="New session" icon={<CalendarIcon />} />
          <CardBody>
            {academy ? (
              <SessionForm />
            ) : (
              <ScaffoldNote>You need an academy membership to plan sessions.</ScaffoldNote>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sessions" subtitle="Most recent 80" />
          <CardBody className="p-0">
            {sessions.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-navy-400">No sessions yet.</p>
            ) : (
              <ul className="divide-y divide-navy-100">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/academy/sessions/${s.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-navy-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">{s.title}</p>
                        <p className="truncate text-xs text-navy-400">
                          {s.scheduled_at
                            ? new Date(s.scheduled_at).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Unscheduled"}
                          {s.duration_min ? ` · ${s.duration_min} min` : ""}
                        </p>
                      </div>
                      <StatusBadge status={SESSION_BADGE[s.status] ?? "draft"} />
                    </Link>
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
