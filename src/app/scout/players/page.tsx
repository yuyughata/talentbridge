import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayersGrid } from "@/components/players/players-grid";
import { requireWorkspace } from "@/lib/auth/session";
import { listPlayers } from "@/lib/players/queries";

export const metadata = { title: "Players" };

export default async function ScoutPlayersPage() {
  const ctx = await requireWorkspace("scout");
  const players = await listPlayers({ limit: 60 });

  return (
    <WorkspaceShell
      workspace="scout"
      activeHref="/scout/players"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Players" description="Players you are authorised to view." />
      <PlayersGrid players={players} />
    </WorkspaceShell>
  );
}
