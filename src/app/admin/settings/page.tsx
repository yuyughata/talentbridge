import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

export default async function Page() {
  const ctx = await requireWorkspace("admin");
  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/settings"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Settings" description="Platform configuration." />
      <ScaffoldNote>Platform settings are coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
