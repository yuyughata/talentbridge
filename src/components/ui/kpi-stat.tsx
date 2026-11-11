import type { ReactNode } from "react";
import { Card } from "./card";
import { TrendUpIcon } from "./icons";

/** KPI tile for the operations dashboard top strip (§4 Suggested key screens). */
export function KpiStat({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  trend?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-lime-700">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="nums mt-2 text-3xl font-semibold tracking-tight text-navy">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-lime-700">
            <TrendUpIcon className="h-3.5 w-3.5" /> {trend}
          </span>
        ) : null}
        {hint ? <span className="text-xs text-navy-400">{hint}</span> : null}
      </div>
    </Card>
  );
}
