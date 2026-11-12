import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Scorecards" };

export default async function Page() {
  const ctx = await requireWorkspace("scout");
  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/scorecards"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Scorecards" description="Attribute scorecards across your reports." />
      <ScaffoldNote>Each report carries its own scorecard — open a report from Match Reports to view and edit its scorecard. A combined scorecards view is coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
