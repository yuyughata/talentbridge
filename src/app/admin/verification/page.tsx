import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { VerificationForm } from "@/components/verification/verification-form";
import { requireWorkspace } from "@/lib/auth/session";
import { listVerificationRecords } from "@/lib/verification/queries";
import { setVerificationStatus } from "@/lib/verification/actions";
import {
  verificationBadge,
  VERIFICATION_TYPE_LABEL,
  isExpiringSoon,
} from "@/lib/verification/status";
import { listPlayers } from "@/lib/players/queries";
import { ShieldIcon } from "@/components/ui/icons";

export const metadata = { title: "Verification" };

export default async function VerificationPage() {
  const ctx = await requireWorkspace("admin");
  const [records, players] = await Promise.all([
    listVerificationRecords(),
    listPlayers({ limit: 100 }),
  ]);
  const playerOptions = players.map((p) => ({
    id: p.id,
    name: p.preferred_name || p.display_name,
  }));

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/verification"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Verification"
        description="Identity, age and registration evidence (§5 M08, §12)."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader title="New verification record" icon={<ShieldIcon />} />
          <CardBody>
            <VerificationForm players={playerOptions} />
            <p className="mt-3 text-xs text-navy-400">
              Store only a pointer to the private document, never the file. Verifying evidence does
              not mark the player profile verified — a human sets that separately (§9).
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Records" subtitle="Most recent 100" />
          <CardBody className="p-0">
            {records.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-navy-400">
                No verification records yet.
              </p>
            ) : (
              <ul className="divide-y divide-navy-100">
                {records.map((r) => (
                  <li key={r.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">
                          {r.player_name ?? "Player"} ·{" "}
                          <span className="text-navy-500">
                            {VERIFICATION_TYPE_LABEL[r.verification_type] ?? r.verification_type}
                          </span>
                        </p>
                        <p className="text-xs text-navy-400">
                          {r.expires_at
                            ? `Expires ${new Date(r.expires_at).toLocaleDateString("en-GB")}`
                            : "No expiry"}
                          {isExpiringSoon(r.expires_at) ? " · expiring soon" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={verificationBadge(r.status)} />
                        {r.status !== "verified" ? (
                          <form
                            action={setVerificationStatus.bind(null, r.id, r.player_id, "verified")}
                          >
                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              Verify
                            </Button>
                          </form>
                        ) : null}
                        {r.status !== "rejected" ? (
                          <form
                            action={setVerificationStatus.bind(null, r.id, r.player_id, "rejected")}
                          >
                            <Button
                              type="submit"
                              size="sm"
                              variant="ghost"
                              className="px-2 py-1 text-xs"
                            >
                              Reject
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
