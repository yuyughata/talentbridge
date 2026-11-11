import { KpiStat } from "@/components/ui/kpi-stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlayerCard } from "@/components/player/player-card";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { UsersIcon, ClipboardIcon, ShieldIcon, CalendarIcon } from "@/components/ui/icons";
import { DEMO_PLAYERS } from "@/lib/demo-data";

export const metadata = { title: "Command Centre" };

export default function AdminDashboard() {
  return (
    <WorkspaceShell workspace="admin" activeHref="/admin">
      <PageHeading
        title="Command Centre"
        description="Operate the platform, enforce quality and manage partner relationships."
      />

      {/* Top KPI strip (§4 Operations dashboard). Values are placeholders until wired to queries. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat
          label="New profiles (7d)"
          value="24"
          icon={<UsersIcon />}
          trend="+18%"
          hint="vs last week"
        />
        <KpiStat label="Reports due" value="9" icon={<ClipboardIcon />} hint="across assignments" />
        <KpiStat label="Verification queue" value="6" icon={<ShieldIcon />} hint="identity / age" />
        <KpiStat
          label="Active academies"
          value="3"
          icon={<CalendarIcon />}
          trend="+1"
          hint="this cycle"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Review queue"
            subtitle="Submitted scouting reports awaiting a reviewer"
            icon={<ClipboardIcon />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm text-navy-600">
              <span>Report pipeline</span>
              <span className="flex gap-2">
                <StatusBadge status="submitted" />
                <StatusBadge status="under_review" />
                <StatusBadge status="approved" />
              </span>
            </div>
            <ScaffoldNote>
              Wire to <code>scouting_reports</code> filtered by status. Approval updates assessment
              history but never auto-verifies the player (§9).
            </ScaffoldNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Verification"
            subtitle="Human review before a player is marked verified"
            icon={<ShieldIcon />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm text-navy-600">
              <span>Evidence states</span>
              <span className="flex gap-2">
                <StatusBadge status="needs_evidence" />
                <StatusBadge status="verified" />
              </span>
            </div>
            <ScaffoldNote>
              Restricted to designated verification staff. Documents stay in private storage with
              short-lived signed URLs (§7, §12).
            </ScaffoldNote>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Talent pool"
            subtitle="Recently assessed players across partner academies"
          />
          <CardBody>
            <div className="grid gap-5 md:grid-cols-3">
              {DEMO_PLAYERS.map((p) => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
