import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Enquiries" };

export default async function Page() {
  const ctx = await requireWorkspace("recruiter");
  return (
    <WorkspaceShell
      workspace="recruiter"
      activeHref="/recruiter/enquiries"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Enquiries" description="Your access enquiries and their status." />
      <ScaffoldNote>Access enquiries are coming soon. Access is currently granted directly by academies and TBA.</ScaffoldNote>
    </WorkspaceShell>
  );
}
