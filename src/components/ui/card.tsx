import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-navy-100 bg-surface shadow-card",
        interactive &&
          "transition-all hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-navy-100 px-5 py-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            {icon}
          </span>
        ) : null}
        <div>
          <h3 className="text-base font-semibold text-navy">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
