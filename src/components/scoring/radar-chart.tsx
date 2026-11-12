import { cn } from "@/lib/utils";

export interface RadarAxis {
  label: string;
  /** 0–10 value (scorecard scale). */
  value: number;
  /** Optional short label for tight layouts. */
  short?: string;
}

/**
 * Accessible attribute radar.
 * Single teal series on a muted navy grid, 0–10 scale. No external chart lib.
 */
export function RadarChart({
  axes,
  size = 280,
  className,
  max = 10,
}: {
  axes: RadarAxis[];
  size?: number;
  className?: string;
  max?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 38;
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const pointAt = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  };

  const gridPolygon = (scale: number) =>
    axes
      .map((_, i) => {
        const p = pointAt(i, radius * scale);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

  const seriesPoints = axes
    .map((a, i) => {
      const p = pointAt(i, (Math.max(0, Math.min(max, a.value)) / max) * radius);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Attribute radar: ${axes.map((a) => `${a.label} ${a.value} out of ${max}`).join(", ")}`}
    >
      {/* grid rings */}
      {rings.map((r) => (
        <polygon key={r} points={gridPolygon(r)} fill="none" stroke="#D9E2EC" strokeWidth={1} />
      ))}
      {/* spokes */}
      {axes.map((_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E3EAF1" strokeWidth={1} />;
      })}
      {/* series area */}
      <polygon
        points={seriesPoints}
        fill="rgba(22,125,141,0.16)"
        stroke="#167D8D"
        strokeWidth={2}
      />
      {/* series vertices */}
      {axes.map((a, i) => {
        const p = pointAt(i, (Math.max(0, Math.min(max, a.value)) / max) * radius);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#167D8D" />;
      })}
      {/* axis labels */}
      {axes.map((a, i) => {
        const p = pointAt(i, radius + 20);
        const anchor = p.x < cx - 4 ? "end" : p.x > cx + 4 ? "start" : "middle";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            dy="0.32em"
            textAnchor={anchor}
            className="fill-navy-600 text-[10px] font-medium"
          >
            {a.short ?? a.label}
          </text>
        );
      })}
    </svg>
  );
}
