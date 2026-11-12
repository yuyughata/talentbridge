import { Card, CardBody } from "@/components/ui/card";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspace } from "@/lib/auth/session";
import { listAuditLogs } from "@/lib/audit/queries";

export const metadata = { title: "Audit" };

export default async function AuditPage() {
  const ctx = await requireWorkspace("admin");
  const logs = await listAuditLogs(150);

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/audit"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Audit"
        description="Append-only trail of sensitive actions."
      />
      {logs.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            No audit entries yet. Reviews, consent changes, status changes and assignments are
            logged here.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-navy-100">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-navy">
                    <span className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs text-navy-600">
                      {l.action}
                    </span>{" "}
                    {l.entity_type}
                  </p>
                  <p className="truncate text-xs text-navy-400">{l.actor_name ?? "system"}</p>
                </div>
                <span className="nums flex-none text-xs text-navy-400">
                  {new Date(l.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
