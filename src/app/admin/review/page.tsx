import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listReviewQueue } from "@/lib/scouting/queries";
import { reportBadge, RECOMMENDATION_LABEL } from "@/lib/scouting/status";

export const metadata = { title: "Review Queue" };

export default async function ReviewQueuePage() {
  const ctx = await requireWorkspace("admin");
  const queue = await listReviewQueue();

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/review"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Review Queue"
        description="Submitted reports awaiting a reviewer decision."
      />
      {queue.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            Nothing to review. Submitted reports appear here.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-navy-100">
            {queue.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-4 hover:bg-navy-50">
                <Link
                  href={`/scout/reports/${r.id}`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">
                      {r.player_name ?? "Player"}
                    </p>
                    <p className="text-xs text-navy-400">
                      {r.recommendation ? RECOMMENDATION_LABEL[r.recommendation] : "—"} ·{" "}
                      {r.confidence} confidence
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.weighted_score != null ? (
                      <span className="nums text-sm font-semibold text-navy">
                        {Number(r.weighted_score).toFixed(0)}
                      </span>
                    ) : null}
                    <StatusBadge status={reportBadge(r.status)} />
                  </div>
                </Link>
                <a
                  href={`/scout/reports/${r.id}/pdf`}
                  className="flex-none text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  PDF
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
