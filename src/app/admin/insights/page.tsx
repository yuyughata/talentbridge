import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import { BarList } from "@/components/analytics/bar-list";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AiInsightsPanel } from "@/components/insights/ai-insights-panel";
import { requireWorkspace } from "@/lib/auth/session";
import { cohortInsights, type Mover } from "@/lib/insights/trends";
import { insightsAiAvailable } from "@/lib/insights/ai";
import { UsersIcon, ClipboardIcon, ChartIcon, BoltIcon } from "@/components/ui/icons";

export const metadata = { title: "Insights" };

function MoverTable({ rows, kind }: { rows: Mover[]; kind: "up" | "down" }) {
  if (rows.length === 0) {
    return <p className="px-5 py-6 text-sm text-navy-400">None yet.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400">
          <th className="px-5 py-2 font-medium">Player</th>
          <th className="py-2 font-medium">First</th>
          <th className="py-2 font-medium">Latest</th>
          <th className="py-2 pr-5 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((m) => (
          <tr key={m.playerId} className="border-b border-navy-50 last:border-0">
            <td className="px-5 py-2.5">
              <Link href={`/players/${m.playerId}`} className="font-medium text-navy hover:text-lime-700">
                {m.name}
              </Link>
              <span className="ml-2 text-xs text-navy-400">{m.position}</span>
            </td>
            <td className="nums py-2.5 text-navy-600">{m.first}</td>
            <td className="nums py-2.5 font-semibold text-navy">{m.latest}</td>
            <td
              className={`nums py-2.5 pr-5 text-right font-semibold ${kind === "up" ? "text-teal-700" : "text-risk-600"}`}
            >
              {m.delta > 0 ? `+${m.delta}` : m.delta}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function InsightsPage() {
  const ctx = await requireWorkspace("admin");
  const data = await cohortInsights();
  const aiOn = insightsAiAvailable();

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/insights"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Player insights"
        description="Trends and growth across players — computed from assessment history."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="Players assessed" value={data.assessedCount} icon={<UsersIcon />} hint={`${data.playerCount} with reports`} />
        <KpiStat label="Tracked (2+ reports)" value={data.trackedCount} icon={<ClipboardIcon />} />
        <KpiStat label="Avg. weighted index" value={data.avgLatestScore ?? "—"} icon={<ChartIcon />} />
        <KpiStat
          label="Avg. growth"
          value={data.avgGrowth != null ? (data.avgGrowth > 0 ? `+${data.avgGrowth}` : `${data.avgGrowth}`) : "—"}
          icon={<BoltIcon />}
          hint="first → latest"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Biggest improvers" subtitle="Largest gain, first → latest assessment" />
          <CardBody className="p-0">
            <MoverTable rows={data.improvers} kind="up" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Watch list" subtitle="Declining weighted index — review context" />
          <CardBody className="p-0">
            <MoverTable rows={data.decliners} kind="down" />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Attribute strengths & gaps" subtitle="Cohort average of latest ratings (0–10)" />
          <CardBody>
            <BarList
              data={data.attributeAverages.map((a) => ({ label: a.label, value: a.avgLatest }))}
              empty="No ratings yet."
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="By position line" subtitle="Average latest weighted index (0–100)" />
          <CardBody>
            <BarList
              data={data.positionAverages.map((p) => ({ label: `${p.label} (${p.count})`, value: p.avgLatest }))}
              empty="No players yet."
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="AI analysis"
            subtitle="Plain-language read of the trends above — grounded only in the computed numbers"
          />
          <CardBody>
            <AiInsightsPanel available={aiOn} />
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
