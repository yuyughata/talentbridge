import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Partnerships" };

export default async function Page() {
  const ctx = await requireWorkspace("admin");
  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/partnerships"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Partnerships" description="Academies, clubs and recruiter partners." />
      <ScaffoldNote>Partnership management is coming soon. Academies and clubs are managed via Users & Roles for now.</ScaffoldNote>
    </WorkspaceShell>
  );
}
