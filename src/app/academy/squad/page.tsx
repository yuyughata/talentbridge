import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayersGrid } from "@/components/players/players-grid";
import { requireWorkspace } from "@/lib/auth/session";
import { listPlayers } from "@/lib/players/queries";
import { UserIcon } from "@/components/ui/icons";

export const metadata = { title: "Squad" };

export default async function AcademySquadPage() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const players = await listPlayers({ academyId: academy?.organisationId });

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/squad"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Squad"
        description={
          academy?.organisationName
            ? `Players at ${academy.organisationName}`
            : "Your academy players"
        }
        action={
          <Link href="/academy/players/new">
            <Button size="sm">
              <UserIcon className="h-4 w-4" /> Add player
            </Button>
          </Link>
        }
      />
      <PlayersGrid players={players} />
    </WorkspaceShell>
  );
}
