import { Card, CardBody } from "@/components/ui/card";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { MediaManager } from "@/components/media/media-manager";
import { requireWorkspace } from "@/lib/auth/session";
import { listMyMedia } from "@/lib/media/queries";
import { listConsents } from "@/lib/players/queries";
import { CONSENT_TYPES } from "@/lib/players/constants";

export const metadata = { title: "Videos" };

const TYPE_LABEL = Object.fromEntries(CONSENT_TYPES.map((c) => [c.value, c.label]));

export default async function PlayerVideosPage() {
  const ctx = await requireWorkspace("player");
  const { playerId, media } = await listMyMedia(ctx.userId);
  const consents = playerId ? await listConsents(playerId) : [];
  const consentOptions = consents
    .filter((c) => c.status === "granted")
    .map((c) => ({
      id: c.id,
      label: `${TYPE_LABEL[c.consent_type] ?? c.consent_type} (${c.version})`,
    }));

  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player/videos"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading title="Videos" description="Your authorised footage and media." />
      {!playerId ? (
        <Card>
          <CardBody>
            <ScaffoldNote>
              No player record is linked to your account yet. Once an academy or TBA links your
              profile, you can manage your media here.
            </ScaffoldNote>
          </CardBody>
        </Card>
      ) : (
        <div className="max-w-2xl">
          <MediaManager playerId={playerId} media={media} consents={consentOptions} canManage />
        </div>
      )}
    </WorkspaceShell>
  );
}
