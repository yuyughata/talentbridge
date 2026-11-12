import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listCurriculumModules, groupByBand } from "@/lib/curriculum/queries";
import { CurriculumManager } from "@/components/curriculum/curriculum-manager";
import { TargetIcon } from "@/components/ui/icons";

export const metadata = { title: "Player Development" };

export default async function AcademyDevelopmentPage() {
  const ctx = await requireWorkspace("academy");
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  const modules = academy ? await listCurriculumModules(academy.organisationId) : [];
  const groups = groupByBand(modules);

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/development"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Player Development"
        description="Build your development curriculum module-by-module, by age band (§5A A)."
      />

      {!academy ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            No academy is linked to your account, so there is no curriculum to manage yet.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Development curriculum"
            subtitle="Age-band pathways — adapt to maturity, school and recovery, not rigid prescriptions"
            icon={<TargetIcon />}
          />
          <CardBody>
            <CurriculumManager academyId={academy.organisationId} groups={groups} canManage={true} />
          </CardBody>
        </Card>
      )}

      <div className="mt-6">
        <Card>
          <CardBody className="text-sm text-navy-500">
            Individual player plans are managed per player — open a player from the{" "}
            <Link href="/academy/squad" className="font-medium text-amber-700 hover:text-amber-800">
              squad
            </Link>{" "}
            and use <span className="font-medium">Development → Manage</span>.
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
