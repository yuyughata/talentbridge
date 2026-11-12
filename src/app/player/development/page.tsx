import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { getMyPlayer, listDevelopmentPlans } from "@/lib/players/queries";

export const metadata = { title: "Development Plan" };

export default async function PlayerDevelopmentPage() {
  const ctx = await requireWorkspace("player");
  const player = await getMyPlayer(ctx.userId);
  const plans = player ? await listDevelopmentPlans(player.id) : [];

  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player/development"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Development plan"
        description="Your progress over time — shown as a journey, not a single score."
      />
      <Card>
        <CardHeader title="Your plans" subtitle="Set with your academy" />
        <CardBody>
          {!player ? (
            <p className="text-sm text-navy-400">No player profile is linked to your account yet.</p>
          ) : plans.length === 0 ? (
            <p className="text-sm text-navy-400">
              No development plan yet. Your academy will set age-appropriate goals with review dates.
            </p>
          ) : (
            <ul className="divide-y divide-navy-100">
              {plans.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-navy">{p.title ?? "Development plan"}</span>
                  <span className="text-xs text-navy-400">
                    {p.review_date
                      ? `Review ${new Date(p.review_date).toLocaleDateString("en-GB")}`
                      : p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </WorkspaceShell>
  );
}
