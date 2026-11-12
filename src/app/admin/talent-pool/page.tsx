import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayersGrid } from "@/components/players/players-grid";
import { requireWorkspace } from "@/lib/auth/session";
import { listPlayers } from "@/lib/players/queries";

export const metadata = { title: "Talent Pool" };

export default async function TalentPoolPage() {
  const ctx = await requireWorkspace("admin");
  const players = await listPlayers({ limit: 90 });

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/talent-pool"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Talent Pool" description="All players across partner academies." />
      <PlayersGrid players={players} />
    </WorkspaceShell>
  );
}
