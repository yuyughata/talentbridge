import { cn } from "@/lib/utils";

/**
 * Circular meter for the weighted score (0–100). A screening aid, shown with
 * context — never styled as a FIFA/guarantee badge (§6, §4).
 */
export function ScoreRing({
  value,
  size = 72,
  label = "Index",
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#D9E2EC"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#167D8D"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="nums text-lg font-semibold leading-none text-navy">
          {clamped.toFixed(0)}
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-navy-400">
          {label}
        </span>
      </div>
    </div>
  );
}
