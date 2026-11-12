import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Invitations" };

export default async function Page() {
  const ctx = await requireWorkspace("academy");
  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/invitations"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Invitations" description="Invite staff and manage pending invites." />
      <ScaffoldNote>Staff invitations are managed by your platform admin for now. Self-service invitations are coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
