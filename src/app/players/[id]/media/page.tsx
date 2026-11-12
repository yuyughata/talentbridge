import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell, PageHeading } from "@/components/workspace/workspace-shell";
import { MediaManager } from "@/components/media/media-manager";
import { requireUser } from "@/lib/auth/session";
import { getPlayer, listConsents } from "@/lib/players/queries";
import { listMedia } from "@/lib/media/queries";
import { CONSENT_TYPES } from "@/lib/players/constants";
import { WORKSPACES } from "@/lib/navigation";
import { ROLE_WORKSPACE } from "@/lib/auth/roles";

export const metadata = { title: "Videos & media" };

const WS_KEYS = ["admin", "academy", "scout", "recruiter", "player"] as const;
const TYPE_LABEL = Object.fromEntries(CONSENT_TYPES.map((c) => [c.value, c.label]));

export default async function PlayerMediaPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser(`/players/${params.id}/media`);
  const player = await getPlayer(params.id);
  if (!player) notFound();

  const wsKey =
    WS_KEYS.find((k) => ctx.roles.some((r) => ROLE_WORKSPACE[r] === WORKSPACES[k].basePath)) ??
    "player";
  const isStaff = ctx.roles.includes("super_admin") || ctx.roles.includes("tba_reviewer");
  const isSelf = player.user_id === ctx.userId;
  const isAcademyStaff = ctx.memberships.some(
    (m) => m.role === "academy_staff" && m.organisationId === player.primary_academy_id,
  );
  const canManage = isStaff || isSelf || isAcademyStaff;

  const [media, consents] = await Promise.all([listMedia(player.id), listConsents(player.id)]);
  const consentOptions = consents
    .filter((c) => c.status === "granted")
    .map((c) => ({
      id: c.id,
      label: `${TYPE_LABEL[c.consent_type] ?? c.consent_type} (${c.version})`,
    }));

  return (
    <WorkspaceShell workspace={wsKey} user={{ displayName: ctx.displayName, email: ctx.email }}>
      <div className="mb-4">
        <Link
          href={`/players/${player.id}`}
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← {player.preferred_name || player.display_name}
        </Link>
      </div>
      <PageHeading
        title="Videos & media"
        description="Authorised match footage and media."
      />
      <div className="max-w-2xl">
        <MediaManager
          playerId={player.id}
          media={media}
          consents={consentOptions}
          canManage={canManage}
        />
      </div>
    </WorkspaceShell>
  );
}
