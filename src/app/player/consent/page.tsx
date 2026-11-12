import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ConsentManager } from "@/components/players/consent-manager";
import { requireWorkspace } from "@/lib/auth/session";
import { getMyPlayer, listConsents } from "@/lib/players/queries";

export const metadata = { title: "Consent & Privacy" };

export default async function PlayerConsentPage() {
  const ctx = await requireWorkspace("player");
  const player = await getMyPlayer(ctx.userId);
  const consents = player ? await listConsents(player.id) : [];

  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player/consent"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Consent & privacy"
        description="You decide what is shared, and with whom. Withdraw at any time."
      />
      <Card>
        <CardHeader title="Your consent" subtitle="Lawful basis for every external share" />
        <CardBody>
          {player ? (
            <ConsentManager playerId={player.id} consents={consents} canManage={true} />
          ) : (
            <p className="text-sm text-navy-400">
              No player profile is linked to your account yet. Ask your academy to connect your
              profile.
            </p>
          )}
        </CardBody>
      </Card>
    </WorkspaceShell>
  );
}
