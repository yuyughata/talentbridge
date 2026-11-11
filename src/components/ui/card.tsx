import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-card border border-navy-100 bg-surface shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-navy-100 px-5 py-4">
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      {subtitle ? <p className="mt-0.5 text-sm text-navy-600">{subtitle}</p> : null}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
