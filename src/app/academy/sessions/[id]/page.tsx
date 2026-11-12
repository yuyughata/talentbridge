import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AttendanceRecorder } from "@/components/training/attendance-recorder";
import { requireWorkspace } from "@/lib/auth/session";
import { getSession, getSessionAttendance, getSessionObservations } from "@/lib/training/queries";
import { listPlayers } from "@/lib/players/queries";

export const metadata = { title: "Training session" };

const SESSION_BADGE: Record<string, StatusKind> = {
  planned: "submitted",
  delivered: "approved",
  cancelled: "rejected",
};

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireWorkspace("academy");
  const session = await getSession(params.id);
  if (!session) notFound();

  const [squad, present, observations] = await Promise.all([
    listPlayers({ academyId: session.academy_id, limit: 100 }),
    getSessionAttendance(session.id),
    getSessionObservations(session.id),
  ]);
  const players = squad.map((p) => ({ id: p.id, name: p.preferred_name || p.display_name }));

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/calendar"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <div className="mb-4">
        <Link
          href="/academy/calendar"
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← Calendar
        </Link>
      </div>
      <PageHeading
        title={session.title}
        description={session.objective ?? "Record attendance and observations (§5A E)."}
        action={<StatusBadge status={SESSION_BADGE[session.status] ?? "draft"} />}
      />

      {session.drill_video_url ? (
        <div className="mb-6">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-navy">Training drills</p>
                <p className="text-xs text-navy-400">Video reference for this session’s drills</p>
              </div>
              <a
                href={session.drill_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-navy px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-700"
              >
                Watch drill video ↗
              </a>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader title="Attendance & observations" subtitle="Per player (§5A E)" />
          <CardBody>
            <AttendanceRecorder sessionId={session.id} players={players} present={present} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Session observations" subtitle="Coaching notes, not diagnoses" />
          <CardBody>
            {observations.length === 0 ? (
              <p className="text-sm text-navy-400">No observations recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {observations.map((o) => (
                  <li key={o.id} className="text-sm">
                    <p className="font-medium text-navy">{o.player_name ?? "Player"}</p>
                    <p className="text-navy-600">{o.observation}</p>
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
