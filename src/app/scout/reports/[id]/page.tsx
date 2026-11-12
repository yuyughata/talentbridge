import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScoreRing } from "@/components/player/score-ring";
import { RadarChart, type RadarAxis } from "@/components/scoring/radar-chart";
import { ReviewPanel } from "@/components/scouting/review-panel";
import { requireUser } from "@/lib/auth/session";
import { getReport } from "@/lib/scouting/queries";
import { submitReport } from "@/lib/scouting/actions";
import { reportBadge, CATEGORY_SHORT, RECOMMENDATION_LABEL } from "@/lib/scouting/status";
import { CATEGORY_DEFINITIONS, type ScorecardCategory } from "@/lib/scoring/model";
import { WORKSPACES } from "@/lib/navigation";
import { ROLE_WORKSPACE } from "@/lib/auth/roles";

export const metadata = { title: "Scouting report" };

const WS_KEYS = ["admin", "academy", "scout", "recruiter", "player"] as const;

export default async function ReportPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser(`/scout/reports/${params.id}`);
  const report = await getReport(params.id);
  if (!report) notFound();

  const wsKey =
    WS_KEYS.find((k) => ctx.roles.some((r) => ROLE_WORKSPACE[r] === WORKSPACES[k].basePath)) ??
    "scout";
  const isStaff = ctx.roles.includes("super_admin") || ctx.roles.includes("tba_reviewer");
  const isAuthor = report.scout_user_id === ctx.userId;
  const canReview =
    isStaff && (report.status === "submitted" || report.status === "needs_clarification");

  const axes: RadarAxis[] = report.ratings
    .slice()
    .sort(
      (a, b) =>
        Object.keys(CATEGORY_SHORT).indexOf(a.category) -
        Object.keys(CATEGORY_SHORT).indexOf(b.category),
    )
    .map((r) => ({
      label: CATEGORY_DEFINITIONS[r.category as ScorecardCategory].label,
      short: CATEGORY_SHORT[r.category as ScorecardCategory],
      value: r.rating_1_to_10,
    }));

  return (
    <WorkspaceShell workspace={wsKey} user={{ displayName: ctx.displayName, email: ctx.email }}>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/scout/reports"
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← Reports
        </Link>
        <div className="flex items-center gap-4">
          <a
            href={`/scout/reports/${report.id}/pdf`}
            className="text-sm font-medium text-lime-300 hover:text-lime-200"
          >
            Download PDF
          </a>
          {isAuthor && report.status === "draft" ? (
            <form action={submitReport.bind(null, report.id)}>
              <Button size="sm" variant="secondary">
                Submit for review
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-navy">
              <Link href={`/players/${report.player_id}`} className="hover:text-amber-700">
                {report.player_name ?? "Player"}
              </Link>
            </h1>
            <p className="mt-0.5 text-sm text-navy-500">
              {report.match?.competition ?? "—"}
              {report.match?.away_team ? ` vs ${report.match.away_team}` : ""}
              {report.position_observed ? ` · ${report.position_observed}` : ""}
              {report.minutes_observed != null ? ` · ${report.minutes_observed}'` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={reportBadge(report.status)} />
            {report.weighted_score != null ? (
              <ScoreRing value={Number(report.weighted_score)} />
            ) : null}
          </div>
        </div>
        <CardBody>
          <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-center">
            <RadarChart axes={axes} size={300} />
            <div>
              <table className="w-full text-sm">
                <tbody>
                  {report.ratings
                    .slice()
                    .sort(
                      (a, b) =>
                        Object.keys(CATEGORY_SHORT).indexOf(a.category) -
                        Object.keys(CATEGORY_SHORT).indexOf(b.category),
                    )
                    .map((r) => (
                      <tr key={r.category} className="border-b border-navy-50 last:border-0">
                        <td className="py-1.5 text-navy">
                          {
                            CATEGORY_DEFINITIONS[r.category as ScorecardCategory].label.split(
                              " — ",
                            )[0]
                          }
                        </td>
                        <td className="nums py-1.5 text-right font-semibold text-navy">
                          {r.rating_1_to_10}/10
                        </td>
                        <td className="py-1.5 pl-3 text-right text-xs text-navy-400">
                          {Math.round(r.weight_snapshot * 100)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Evidence" />
          <CardBody className="space-y-3 text-sm">
            <Block label="Observed strengths" value={report.strengths} />
            <Block label="Development areas" value={report.development_areas} />
            {report.narrative ? <Block label="Narrative" value={report.narrative} /> : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Assessment" />
          <CardBody className="space-y-2 text-sm">
            <Row
              label="Recommendation"
              value={(report.recommendation && RECOMMENDATION_LABEL[report.recommendation]) || "—"}
            />
            <Row
              label="Confidence"
              value={`${report.confidence}${report.confidence_reason ? ` — ${report.confidence_reason}` : ""}`}
            />
            {report.speed ? (
              <Row
                label="Speed sub-scores"
                value={`Acc ${report.speed.acceleration ?? "–"} · Top ${report.speed.top_speed ?? "–"} · Rep ${report.speed.repeated_sprint ?? "–"} · Football ${report.speed.football_speed ?? "–"}`}
              />
            ) : null}
            {report.review_comment ? (
              <Block label="Reviewer comment" value={report.review_comment} />
            ) : null}
          </CardBody>
        </Card>
      </div>

      {report.overlay.length > 0 ? (
        <div className="mt-6">
          <Card>
            <CardHeader
              title="Position-specific assessment"
              subtitle="Parameters that differ by position (§6 overlays) — does not change the weighted score"
            />
            <CardBody>
              <table className="w-full text-sm">
                <tbody>
                  {report.overlay.map((o) => (
                    <tr
                      key={o.attribute_key ?? o.attribute}
                      className="border-b border-navy-50 last:border-0"
                    >
                      <td className="py-1.5 text-navy">{o.attribute}</td>
                      <td className="nums py-1.5 text-right font-semibold text-navy">
                        {o.rating_1_to_10 != null ? `${o.rating_1_to_10}/10` : "—"}
                      </td>
                      {o.note ? (
                        <td className="py-1.5 pl-3 text-xs text-navy-400">{o.note}</td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {canReview ? (
        <div className="mt-6">
          <Card>
            <CardHeader title="Reviewer decision" subtitle="Approve, return or reject (§9)" />
            <CardBody>
              <ReviewPanel reportId={report.id} />
            </CardBody>
          </Card>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}

function Block({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</p>
      <p className="mt-0.5 text-navy">{value || "—"}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-navy-400">{label}</span>
      <span className="text-right font-medium text-navy">{value}</span>
    </div>
  );
}
