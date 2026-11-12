import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Submissions" };

export default async function Page() {
  const ctx = await requireWorkspace("scout");
  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/submissions"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Submissions" description="Your submitted reports and their review status." />
      <ScaffoldNote>Submitted reports move to the reviewer queue. Track them from Match Reports; a dedicated submissions view is coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
