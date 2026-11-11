import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/auth/actions";
import { unreadNotificationCount } from "@/lib/notifications/queries";
import { WORKSPACES, type IconKey, type WorkspaceNav } from "@/lib/navigation";
import {
  BallIcon,
  BellIcon,
  BoltIcon,
  CalendarIcon,
  ChartIcon,
  CheckBadgeIcon,
  ClipboardIcon,
  GaugeIcon,
  GridIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  TargetIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
  WhistleIcon,
} from "@/components/ui/icons";

const ICONS: Record<IconKey, (p: { className?: string }) => ReactNode> = {
  grid: GridIcon,
  ball: BallIcon,
  user: UserIcon,
  video: VideoIcon,
  clipboard: ClipboardIcon,
  chart: ChartIcon,
  gauge: GaugeIcon,
  calendar: CalendarIcon,
  search: SearchIcon,
  target: TargetIcon,
  shield: ShieldIcon,
  lock: LockIcon,
  users: UsersIcon,
  whistle: WhistleIcon,
  badge: CheckBadgeIcon,
  bolt: BoltIcon,
};

/**
 * Shared chrome for an authenticated workspace: brand, workspace nav (§3) and a
 * content area. Auth/role gating is wired in during MVP engineering; this shell
 * is the layout the real pages render into.
 */
export async function WorkspaceShell({
  workspace,
  activeHref,
  user,
  children,
}: {
  workspace: keyof typeof WORKSPACES;
  activeHref?: string;
  user?: { displayName: string; email: string; roleLabel?: string };
  children: ReactNode;
}) {
  const nav: WorkspaceNav = WORKSPACES[workspace];
  const initials = (user?.displayName ?? "TB")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const unread = user ? await unreadNotificationCount() : 0;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-navy-100/70 bg-canvas/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Logo />
            </Link>
            <span className="hidden rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-500 sm:inline">
              {nav.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-navy">{user.displayName}</p>
                <p className="text-xs leading-tight text-navy-400">
                  {user.roleLabel ?? user.email}
                </p>
              </div>
            ) : null}
            {user ? (
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy"
              >
                <BellIcon className="h-5 w-5" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {initials}
            </span>
            {user ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      {/* mobile workspace nav */}
      <div className="border-b border-navy-100 bg-surface lg:hidden">
        <nav
          className="container-page flex gap-1 overflow-x-auto py-2"
          aria-label={`${nav.title} navigation`}
        >
          {nav.items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex flex-none items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-semibold text-lime-700"
                    : "flex flex-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-500 hover:bg-navy-50"
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[232px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1" aria-label={`${nav.title} navigation`}>
            {nav.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-lime-700 ring-1 ring-inset ring-teal-100"
                      : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy"
                  }
                >
                  <Icon className={active ? "h-4 w-4 text-lime-700" : "h-4 w-4 text-navy-400"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

/** Small marker used on placeholder screens that are scaffolded but not built. */
export function ScaffoldNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-teal-200 bg-teal-50/50 px-4 py-3 text-sm text-navy-600">
      {children}
    </div>
  );
}

/** Page header for a workspace screen. */
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">{title}</h1>
        {description ? <p className="mt-1 text-sm text-navy-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
