import type { Bar } from "@/lib/analytics/queries";

/** Simple horizontal bar list for distributions (§5 M12). Accessible, no chart lib. */
export function BarList({ data, empty = "No data yet." }: { data: Bar[]; empty?: string }) {
  if (data.length === 0) return <p className="text-sm text-navy-400">{empty}</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3">
          <span className="w-16 flex-none truncate text-sm text-navy" title={d.label}>
            {d.label}
          </span>
          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-navy-50">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-teal-sheen"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </span>
          <span className="nums w-8 flex-none text-right text-sm font-semibold text-navy">
            {d.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
