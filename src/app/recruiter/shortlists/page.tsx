import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Shortlists" };

export default async function Page() {
  const ctx = await requireWorkspace("recruiter");
  return (
    <WorkspaceShell
      workspace="recruiter"
      activeHref="/recruiter/shortlists"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Shortlists" description="Players you are tracking." />
      <ScaffoldNote>Shortlisting is coming soon. For now, open granted player portfolios from Discover.</ScaffoldNote>
    </WorkspaceShell>
  );
}
