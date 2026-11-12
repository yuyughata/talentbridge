import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayerForm } from "@/components/players/player-form";
import { ConsentManager } from "@/components/players/consent-manager";
import { requireWorkspace } from "@/lib/auth/session";
import { getMyPlayer, listConsents, profileBadge } from "@/lib/players/queries";
import { updatePlayer } from "@/lib/players/actions";

export const metadata = { title: "My profile" };

export default async function PlayerProfilePage() {
  const ctx = await requireWorkspace("player");
  const player = await getMyPlayer(ctx.userId);

  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player/profile"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="My profile" description="Maintain your approved information (§5 M02)." />

      {!player ? (
        <Card>
          <CardBody>
            <ScaffoldNote>
              No player record is linked to your account yet. An academy or TBA creates your player
              profile and links it to you; you can then maintain it here.
            </ScaffoldNote>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Profile status"
              action={<StatusBadge status={profileBadge(player.profile_status)} />}
            />
            <CardBody>
              <div className="flex items-center justify-between text-sm text-navy-600">
                <span>Completeness</span>
                <span className="nums font-semibold text-navy">{player.completeness_percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-50">
                <div
                  className="h-full rounded-full bg-teal-sheen"
                  style={{ width: `${player.completeness_percent}%` }}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Edit details" />
            <CardBody>
              <PlayerForm
                action={updatePlayer.bind(null, player.id)}
                player={player}
                submitLabel="Save my profile"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Consent & privacy"
              subtitle="You control who can see your profile (§5 M03)"
            />
            <CardBody>
              <ConsentManager
                playerId={player.id}
                consents={await listConsents(player.id)}
                canManage
              />
            </CardBody>
          </Card>
        </div>
      )}
    </WorkspaceShell>
  );
}
