import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Player Portfolios" };

export default async function Page() {
  const ctx = await requireWorkspace("recruiter");
  return (
    <WorkspaceShell
      workspace="recruiter"
      activeHref="/recruiter/portfolios"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Player Portfolios" description="Consent-granted player portfolios." />
      <ScaffoldNote>Open the profiles you have been granted access to from Discover. A portfolios workspace is coming soon.</ScaffoldNote>
    </WorkspaceShell>
  );
}
