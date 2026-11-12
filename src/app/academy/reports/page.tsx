import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Reports" };

export default async function Page() {
  const ctx = await requireWorkspace("academy");
  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/reports"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Reports" description="Academy reports and summaries." />
      <ScaffoldNote>Download your academy summary PDF from the Overview page. Richer academy reporting is coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
