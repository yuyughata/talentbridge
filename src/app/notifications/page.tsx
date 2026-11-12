import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireUser } from "@/lib/auth/session";
import { listMyNotifications } from "@/lib/notifications/queries";
import { markAllNotificationsRead } from "@/lib/notifications/actions";
import { WORKSPACES } from "@/lib/navigation";
import { ROLE_WORKSPACE } from "@/lib/auth/roles";

export const metadata = { title: "Notifications" };

const WS_KEYS = ["admin", "academy", "scout", "recruiter", "player"] as const;

export default async function NotificationsPage() {
  const ctx = await requireUser("/notifications");
  const items = await listMyNotifications();
  const wsKey =
    WS_KEYS.find((k) => ctx.roles.some((r) => ROLE_WORKSPACE[r] === WORKSPACES[k].basePath)) ??
    "player";
  const hasUnread = items.some((n) => !n.read_at);

  return (
    <WorkspaceShell
      workspace={wsKey}
      activeHref="/notifications"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Notifications"
        description="Assignments, report reviews and other updates."
        action={
          hasUnread ? (
            <form action={markAllNotificationsRead}>
              <Button size="sm" variant="outline">
                Mark all read
              </Button>
            </form>
          ) : null
        }
      />
      {items.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-navy-400">
            You&apos;re all caught up.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-navy-100">
            {items.map((n) => {
              const inner = (
                <div className="flex items-start gap-3 px-5 py-4">
                  <span
                    className={
                      n.read_at
                        ? "mt-1.5 h-2 w-2 flex-none rounded-full bg-navy-100"
                        : "mt-1.5 h-2 w-2 flex-none rounded-full bg-teal"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    {n.body ? <p className="mt-0.5 text-sm text-navy-500">{n.body}</p> : null}
                    <p className="mt-1 text-xs text-navy-400">
                      {new Date(n.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link href={n.link} className="block hover:bg-navy-50">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
