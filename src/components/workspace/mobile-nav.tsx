"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconKey, NavItem } from "@/lib/navigation";
import {
  BallIcon,
  BoltIcon,
  CalendarIcon,
  ChartIcon,
  CheckBadgeIcon,
  ClipboardIcon,
  CloseIcon,
  GaugeIcon,
  GridIcon,
  LockIcon,
  MenuIcon,
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
 * Mobile workspace navigation: a hamburger button that opens a slide-down
 * drawer of the full nav. Shown under `lg`; the desktop sidebar takes over
 * above it. Closes on route change and on Escape. Server-rendered shells pass
 * plain serializable nav data.
 */
export function MobileNav({
  title,
  items,
  activeHref,
}: {
  title: string;
  items: NavItem[];
  activeHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape; lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const active = items.find((i) => i.href === activeHref);

  return (
    <div className="border-b border-white/10 bg-ink-900 lg:hidden">
      <div className="container-page flex h-12 items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-workspace-nav"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          <span>Menu</span>
        </button>
        <span className="truncate text-sm font-semibold text-white/70">
          {active?.label ?? title}
        </span>
      </div>

      {open ? (
        <>
          {/* Backdrop below the panel to catch taps outside the links. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[112px] z-20 bg-black/40 lg:hidden"
          />
          <nav
            id="mobile-workspace-nav"
            aria-label={`${title} navigation`}
            className="relative z-30 max-h-[70vh] overflow-y-auto border-t border-white/10 bg-ink-900 pb-3"
          >
            <ul className="container-page space-y-1 py-2">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const isActive = item.href === activeHref;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={
                        isActive
                          ? "flex items-center gap-3 rounded-lg bg-lime-500/15 px-3 py-3 text-sm font-semibold text-lime-300 ring-1 ring-inset ring-lime-500/25"
                          : "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    >
                      <Icon className={isActive ? "h-5 w-5 text-lime-300" : "h-5 w-5 text-white/40"} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
