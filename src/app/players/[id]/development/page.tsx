import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell, PageHeading } from "@/components/workspace/workspace-shell";
import { PlanManager } from "@/components/development/plan-manager";
import { requireUser } from "@/lib/auth/session";
import { getPlayer } from "@/lib/players/queries";
import { listPlansWithGoals, listReviews } from "@/lib/development/queries";
import { WORKSPACES } from "@/lib/navigation";
import { ROLE_WORKSPACE } from "@/lib/auth/roles";

export const metadata = { title: "Development plan" };

const WS_KEYS = ["admin", "academy", "scout", "recruiter", "player"] as const;

export default async function PlayerDevelopmentPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser(`/players/${params.id}/development`);
  const player = await getPlayer(params.id);
  if (!player) notFound();

  const wsKey =
    WS_KEYS.find((k) => ctx.roles.some((r) => ROLE_WORKSPACE[r] === WORKSPACES[k].basePath)) ??
    "player";
  const isStaff = ctx.roles.includes("super_admin") || ctx.roles.includes("tba_reviewer");
  const isAcademyStaff = ctx.memberships.some(
    (m) => m.role === "academy_staff" && m.organisationId === player.primary_academy_id,
  );
  const canManage = isStaff || isAcademyStaff;

  const [plans, reviews] = await Promise.all([
    listPlansWithGoals(player.id),
    listReviews(player.id),
  ]);

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
        title="Development plan"
        description="Individual development plan and 12-week reviews."
      />
      <PlanManager playerId={player.id} plans={plans} reviews={reviews} canManage={canManage} />
    </WorkspaceShell>
  );
}
