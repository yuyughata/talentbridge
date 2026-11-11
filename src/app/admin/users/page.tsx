import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { InviteForm } from "@/components/admin/invite-form";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL, type AppRole } from "@/lib/auth/roles";
import { revokeInvitation } from "@/lib/auth/invitations";
import { UsersIcon } from "@/components/ui/icons";

export const metadata = { title: "Users & Roles" };

const INVITE_BADGE: Record<string, StatusKind> = {
  pending: "submitted",
  accepted: "approved",
  revoked: "rejected",
  expired: "needs_evidence",
};

export default async function AdminUsersPage() {
  const ctx = await requireWorkspace("admin");
  const supabase = createClient();

  const [{ data: orgs }, { data: invites }] = await Promise.all([
    supabase.from("organisations").select("id, name, type").order("name"),
    supabase
      .from("invitations")
      .select("id, email, role, status, expires_at, organisations(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const organisations = (orgs ?? []).map((o) => ({ id: o.id as string, name: o.name as string }));

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/users"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Users & Roles"
        description="Invite people and manage organisation access."
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader
            title="Invite someone"
            subtitle="Invite-first onboarding (§5 M01)"
            icon={<UsersIcon />}
          />
          <CardBody>
            <InviteForm organisations={organisations} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Invitations" subtitle="Most recent 50" />
          <CardBody className="p-0">
            {invites && invites.length > 0 ? (
              <ul className="divide-y divide-navy-100">
                {invites.map((inv) => {
                  const org = inv.organisations as
                    | { name: string | null }
                    | { name: string | null }[]
                    | null;
                  const orgName = Array.isArray(org) ? org[0]?.name : org?.name;
                  return (
                    <li
                      key={inv.id as string}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">
                          {inv.email as string}
                        </p>
                        <p className="truncate text-xs text-navy-400">
                          {ROLE_LABEL[inv.role as AppRole]}
                          {orgName ? ` · ${orgName}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={INVITE_BADGE[inv.status as string] ?? "draft"} />
                        {inv.status === "pending" ? (
                          <form action={revokeInvitation}>
                            <input type="hidden" name="id" value={inv.id as string} />
                            <button
                              type="submit"
                              className="text-xs font-medium text-navy-400 hover:text-risk-600"
                            >
                              Revoke
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-navy-400">No invitations yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
