import Link from "next/link";
import { KpiStat } from "@/components/ui/kpi-stat";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayersGrid } from "@/components/players/players-grid";
import {
  UsersIcon,
  ClipboardIcon,
  ShieldIcon,
  CalendarIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { requireWorkspace } from "@/lib/auth/session";
import { adminKpis } from "@/lib/dashboard/queries";
import { listPlayers } from "@/lib/players/queries";

export const metadata = { title: "Command Centre" };

export default async function AdminDashboard() {
  const ctx = await requireWorkspace("admin");
  const [kpis, players] = await Promise.all([adminKpis(), listPlayers({ limit: 6 })]);

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Command Centre"
        description="Operate the platform, enforce quality and manage partner relationships."
        action={
          <a
            href="/admin/analytics/pdf"
            className="text-sm font-medium text-lime-300 hover:text-lime-200"
          >
            Operations summary PDF
          </a>
        }
      />

      {/* Top KPI strip — live counts. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="New profiles (7d)" value={kpis.newProfiles7d} icon={<UsersIcon />} />
        <KpiStat
          label="Reports due"
          value={kpis.reportsDue}
          icon={<ClipboardIcon />}
          hint="awaiting review"
        />
        <KpiStat
          label="Verification queue"
          value={kpis.verificationQueue}
          icon={<ShieldIcon />}
          hint="pending evidence"
        />
        <KpiStat label="Active academies" value={kpis.activeAcademies} icon={<CalendarIcon />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Link href="/admin/review" className="block">
          <Card interactive>
            <CardHeader
              title="Review queue"
              subtitle="Submitted reports awaiting a reviewer"
              icon={<ClipboardIcon />}
              action={<ArrowUpRightIcon className="h-5 w-5 text-navy-300" />}
            />
            <CardBody className="text-sm text-navy-500">
              {kpis.reportsDue > 0
                ? `${kpis.reportsDue} report${kpis.reportsDue === 1 ? "" : "s"} to review.`
                : "Nothing waiting."}{" "}
              Approval updates assessment history but never auto-verifies the player.
            </CardBody>
          </Card>
        </Link>

        <Link href="/admin/verification" className="block">
          <Card interactive>
            <CardHeader
              title="Verification"
              subtitle="Human review before a player is marked verified"
              icon={<ShieldIcon />}
              action={<ArrowUpRightIcon className="h-5 w-5 text-navy-300" />}
            />
            <CardBody className="text-sm text-navy-500">
              {kpis.verificationQueue > 0
                ? `${kpis.verificationQueue} record${kpis.verificationQueue === 1 ? "" : "s"} pending.`
                : "No pending evidence."}{" "}
              Documents stay in private storage with short-lived signed URLs.
            </CardBody>
          </Card>
        </Link>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Talent pool"
            subtitle="Recently assessed players across partner academies"
            action={
              <Link
                href="/admin/talent-pool"
                className="text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                View all
              </Link>
            }
          />
          <CardBody>
            <PlayersGrid players={players} />
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
