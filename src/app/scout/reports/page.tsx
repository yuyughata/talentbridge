import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listMyReports } from "@/lib/scouting/queries";
import { reportBadge, RECOMMENDATION_LABEL } from "@/lib/scouting/status";
import { ClipboardIcon } from "@/components/ui/icons";

export const metadata = { title: "Match Reports" };

export default async function ScoutReportsPage() {
  const ctx = await requireWorkspace("scout");
  const reports = await listMyReports(ctx.userId);

  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/reports"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Match Reports"
        description="Your scouting reports."
        action={
          <Link href="/scout/reports/new">
            <Button size="sm">
              <ClipboardIcon className="h-4 w-4" /> New report
            </Button>
          </Link>
        }
      />
      {reports.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            No reports yet. Create your first match report.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-navy-100">
            {reports.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/scout/reports/${r.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-navy-50"
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
              </li>
            ))}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
