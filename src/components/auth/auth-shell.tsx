import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { PitchLines } from "@/components/brand/pitch";

/**
 * Split-screen auth layout: a premium navy pitch panel and a clean form panel.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-2">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy-depth p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <PitchLines className="pointer-events-none absolute -right-20 bottom-0 h-[560px] w-[760px] text-white/[0.07]" />
        <div className="pitch-lines absolute inset-0 opacity-40" />
        <Link href="/" className="relative">
          <Logo dark />
        </Link>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight">
            Scout smarter. Develop with evidence.
          </h2>
          <p className="mt-4 text-navy-100/85">
            A trusted football data and workflow system for discovering, assessing and developing
            African talent — private by default and consent-based.
          </p>
        </div>
        <p className="relative text-xs text-navy-100/70">
          Private by default · Consent-based sharing · Human review before verification.
        </p>
      </aside>

      {/* form panel */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm rounded-2xl border border-navy-100 bg-surface p-8 text-navy shadow-lift sm:p-10">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-sm text-navy-500">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
