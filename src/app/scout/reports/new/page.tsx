import Link from "next/link";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ReportForm } from "@/components/scouting/report-form";
import { requireWorkspace } from "@/lib/auth/session";
import { listPlayers } from "@/lib/players/queries";

export const metadata = { title: "New report" };

export default async function NewReportPage() {
  const ctx = await requireWorkspace("scout");
  const players = await listPlayers({ limit: 100 });
  const options = players.map((p) => ({ id: p.id, name: p.preferred_name || p.display_name }));

  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/reports"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="New match report"
        description="Structured scorecard including Speed (§6)."
        action={
          <Link
            href="/scout/reports"
            className="text-sm font-medium text-lime-700 hover:text-lime-800"
          >
            Back to reports
          </Link>
        }
      />
      <div className="max-w-3xl">
        <ReportForm players={options} />
      </div>
    </WorkspaceShell>
  );
}
