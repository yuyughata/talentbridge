import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { RadarChart } from "@/components/scoring/radar-chart";
import { ScoreRing } from "@/components/player/score-ring";
import { requireWorkspace } from "@/lib/auth/session";
import { getMyPlayer } from "@/lib/players/queries";
import { latestPlayerScorecard } from "@/lib/scouting/queries";

export const metadata = { title: "Assessments" };

export default async function PlayerAssessmentsPage() {
  const ctx = await requireWorkspace("player");
  const player = await getMyPlayer(ctx.userId);
  const scorecard = player ? await latestPlayerScorecard(player.id) : null;

  return (
    <WorkspaceShell
      workspace="player"
      activeHref="/player/assessments"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Assessments"
        description="Your attribute profile from the latest assessment (a screening aid, not a verdict)."
      />
      <Card>
        <CardHeader title="Attribute profile" subtitle="Seven weighted categories (§6)" />
        <CardBody>
          {scorecard && scorecard.axes.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-center">
              <RadarChart axes={scorecard.axes} size={300} />
              <div className="flex items-center gap-4">
                {scorecard.weightedScore != null ? (
                  <ScoreRing value={Number(scorecard.weightedScore)} />
                ) : null}
                <div>
                  <p className="text-sm text-navy-500">Weighted index</p>
                  <p className="nums text-2xl font-semibold text-navy">
                    {scorecard.weightedScore != null
                      ? Number(scorecard.weightedScore).toFixed(0)
                      : "—"}
                    <span className="text-sm text-navy-400"> / 100</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy-400">
              {player
                ? "No assessment yet. Once a scout files a report, your profile appears here."
                : "No player profile is linked to your account yet."}
            </p>
          )}
        </CardBody>
      </Card>
    </WorkspaceShell>
  );
}
