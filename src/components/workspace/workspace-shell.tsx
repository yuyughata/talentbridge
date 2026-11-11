import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { WORKSPACES, type WorkspaceNav } from "@/lib/navigation";

/**
 * Shared chrome for an authenticated workspace: brand, workspace nav (§3) and a
 * content area. Auth/role gating is wired in during MVP engineering; this shell
 * is the layout the real pages render into.
 */
export function WorkspaceShell({
  workspace,
  activeHref,
  children,
}: {
  workspace: keyof typeof WORKSPACES;
  activeHref?: string;
  children: ReactNode;
}) {
  const nav: WorkspaceNav = WORKSPACES[workspace];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-navy-100 bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <span className="hidden text-sm font-medium text-navy-600 sm:inline">
              / {nav.title}
            </span>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1" aria-label={`${nav.title} navigation`}>
            {nav.items.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "block rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                      : "block rounded-lg px-3 py-2 text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>
          <p className="mb-1 text-sm text-navy-600">{nav.purpose}</p>
          {children}
        </main>
      </div>
    </div>
  );
}

/** Small marker used on placeholder screens that are scaffolded but not built. */
export function ScaffoldNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-teal-100 bg-teal-50/40 px-4 py-3 text-sm text-navy-600">
      {children}
    </div>
  );
}
