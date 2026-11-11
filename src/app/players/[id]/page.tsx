import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlayerForm } from "@/components/players/player-form";
import { ConsentManager } from "@/components/players/consent-manager";
import { requireUser } from "@/lib/auth/session";
import { getPlayer, listConsents, listDevelopmentPlans, profileBadge } from "@/lib/players/queries";
import { listPlayerVerifications } from "@/lib/verification/queries";
import { verificationBadge, VERIFICATION_TYPE_LABEL } from "@/lib/verification/status";
import { updatePlayer, setPlayerStatus } from "@/lib/players/actions";
import { WORKSPACES } from "@/lib/navigation";
import { ROLE_WORKSPACE } from "@/lib/auth/roles";
import { ageBandFromDob, positionCode } from "@/lib/players/constants";

export const metadata = { title: "Player profile" };

const WS_KEYS = ["admin", "academy", "scout", "recruiter", "player"] as const;

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const ctx = await requireUser(`/players/${params.id}`);
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
  const canEdit = isStaff || isSelf || isAcademyStaff;
  const canViewSensitive = canEdit; // staff / own academy / self (§2)

  const [consents, plans, verifications] = await Promise.all([
    listConsents(player.id),
    listDevelopmentPlans(player.id),
    isStaff ? listPlayerVerifications(player.id) : Promise.resolve([]),
  ]);

  const initials = (player.preferred_name || player.display_name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <WorkspaceShell workspace={wsKey} user={{ displayName: ctx.displayName, email: ctx.email }}>
      {/* identity header */}
      <Card className="overflow-hidden">
        <div className="relative bg-navy-depth px-6 py-6 text-white">
          <div className="pitch-lines absolute inset-0 opacity-40" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {player.portrait_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={player.portrait_url}
                  alt={`${player.preferred_name || player.display_name} portrait`}
                  className="h-16 w-16 flex-none rounded-xl object-cover ring-1 ring-white/15"
                />
              ) : (
                <span className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-white/10 text-xl font-bold ring-1 ring-white/15">
                  {initials}
                </span>
              )}
              <div>
                <h1 className="text-xl font-semibold">
                  {player.preferred_name || player.display_name}
                </h1>
                <p className="text-sm text-navy-100">
                  {player.primary_position ?? "Unassigned"} · {player.dominant_foot ?? "—"} footed
                  {player.academy_name ? ` · ${player.academy_name}` : ""}
                </p>
              </div>
            </div>
            <span className="rounded-md bg-amber-sheen px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-navy-900">
              {positionCode(player.primary_position)}
            </span>
          </div>
        </div>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={profileBadge(player.profile_status)} />
            <span className="text-sm text-navy-500">
              Profile completeness{" "}
              <span className="nums font-semibold text-navy">{player.completeness_percent}%</span>
            </span>
          </div>
          {canEdit &&
          (player.profile_status === "draft" || player.profile_status === "needs_evidence") ? (
            <form action={setPlayerStatus.bind(null, player.id, "submitted")}>
              <Button size="sm" variant="secondary">
                Submit for review
              </Button>
            </form>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Overview */}
        <Card>
          <CardHeader title="Overview" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Field label="Primary position" value={player.primary_position} />
              <Field label="Dominant foot" value={player.dominant_foot} />
              <Field label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
              <Field label="Location" value={player.location} />
              <Field label="Age band" value={ageBandFromDob(player.date_of_birth)} />
              <Field
                label="Nationality"
                value={canViewSensitive ? player.nationality : "Restricted"}
              />
              <Field
                label="Secondary positions"
                value={(player.secondary_positions ?? []).join(", ") || null}
              />
              <Field label="Languages" value={(player.languages ?? []).join(", ") || null} />
            </dl>
            {!canViewSensitive ? (
              <p className="mt-4 text-xs text-navy-400">
                Date of birth, nationality and documents are restricted and not shown on this view
                (§2, §12).
              </p>
            ) : null}
          </CardBody>
        </Card>

        {/* Development */}
        <Card>
          <CardHeader
            title="Development"
            subtitle="Plans and review dates (§5 M07)"
            action={
              <Link
                href={`/players/${player.id}/development`}
                className="text-sm font-medium text-lime-700 hover:text-lime-800"
              >
                Manage →
              </Link>
            }
          />
          <CardBody>
            {plans.length > 0 ? (
              <ul className="divide-y divide-navy-100">
                {plans.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-navy">{p.title ?? "Development plan"}</span>
                    <span className="text-xs text-navy-400">
                      {p.review_date
                        ? `Review ${new Date(p.review_date).toLocaleDateString("en-GB")}`
                        : p.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-400">
                No development plan yet. Progress is shown over time, not a single score (§5A G).
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Videos & media (§5 M06) */}
      <div className="mt-6">
        <Card>
          <CardHeader
            title="Videos & media"
            subtitle="Authorised match footage (§5 M06)"
            action={
              <Link
                href={`/players/${player.id}/media`}
                className="text-sm font-medium text-lime-700 hover:text-lime-800"
              >
                Open →
              </Link>
            }
          />
          <CardBody className="text-sm text-navy-500">
            Link footage from a camera or video provider. Private by default; shared/public needs
            recorded consent (§2).
          </CardBody>
        </Card>
      </div>

      {/* Consent */}
      <div className="mt-6">
        <Card>
          <CardHeader
            title="Consent & privacy"
            subtitle="Lawful basis for every external share (§5 M03)"
          />
          <CardBody>
            <ConsentManager playerId={player.id} consents={consents} canManage={canEdit} />
          </CardBody>
        </Card>
      </div>

      {/* Verification (staff only, §5 M08, §12) */}
      {isStaff ? (
        <div className="mt-6">
          <Card>
            <CardHeader
              title="Verification"
              subtitle="Evidence of identity, age and registration (§5 M08)"
            />
            <CardBody>
              {verifications.length === 0 ? (
                <p className="text-sm text-navy-400">
                  No verification records. Add them in Verification.
                </p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {verifications.map((v) => (
                    <li key={v.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <span className="font-medium text-navy">
                          {VERIFICATION_TYPE_LABEL[v.verification_type] ?? v.verification_type}
                        </span>
                        {v.expires_at ? (
                          <span className="ml-2 text-xs text-navy-400">
                            expires {new Date(v.expires_at).toLocaleDateString("en-GB")}
                          </span>
                        ) : null}
                      </div>
                      <StatusBadge status={verificationBadge(v.status)} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* Edit */}
      {canEdit ? (
        <div className="mt-6">
          <Card>
            <CardHeader title="Edit details" />
            <CardBody>
              <PlayerForm
                action={updatePlayer.bind(null, player.id)}
                player={player}
                submitLabel="Save changes"
                restrictedPii={canViewSensitive}
              />
            </CardBody>
          </Card>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-navy-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-navy">{value && value !== "—" ? value : "—"}</dd>
    </div>
  );
}
