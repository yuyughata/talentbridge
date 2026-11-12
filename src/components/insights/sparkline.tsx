/** Minimal dependency-free sparkline for a score series (0–100). */
export function Sparkline({
  values,
  width = 160,
  height = 44,
  max = 100,
}: {
  values: number[];
  width?: number;
  height?: number;
  max?: number;
}) {
  if (values.length < 2) return null;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const n = values.length - 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / n) * w;
    const y = pad + h - (Math.max(0, Math.min(max, v)) / max) * h;
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  const rising = values[values.length - 1]! >= values[0]!;
  const stroke = rising ? "#4D7C0F" : "#C0392B";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Score trend">
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={stroke} />
    </svg>
  );
}
