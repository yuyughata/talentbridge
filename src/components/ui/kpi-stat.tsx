import { Card } from "./card";

/** KPI tile for the operations dashboard top strip (§4 Suggested key screens). */
export function KpiStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-sm font-medium text-navy-600">{label}</p>
      <p className="nums mt-1 text-3xl font-semibold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-600">{hint}</p> : null}
    </Card>
  );
}
