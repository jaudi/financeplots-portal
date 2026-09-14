/** One spoke of the snowflake. */
export interface SnowflakeAxis {
  label: string;
  /** Where the company's figure sits within its index, 0–100. */
  position: number;
  /** Hover text for the point. */
  title?: string;
}

// A radar drawn from the measures the user chose — nothing else.
//
// This replaces the old FactorSnowflake, which was removed for UK MAR reasons
// because it was a verdict in disguise: it plotted the site's own weighted
// factor scores, flipped axes so that "better" always pointed outwards, and
// coloured the shape green, amber or red. The rules here are the opposite, and
// they are the reason this chart is allowed to exist:
//
// - Every axis is a plain position within the index: further out means a
//   HIGHER figure, never a better one. A high P/E or a high debt ratio sits far
//   out too. The site never inverts an axis; the visitor can reverse one
//   themselves ("Further out means" in StockScreener), and the label says so.
// - One neutral colour for every company. No green/red, no total, no area score.
// - Axes are only the measures the user filtered on, shown only after they run.

const MIN_DRAWN = 3; // so a figure at the very bottom of the index stays visible

export default function NeutralSnowflake({ axes, size = 220 }: { axes: SnowflakeAxis[]; size?: number }) {
  const n = axes.length;
  if (n < 3) return null;

  const pad = 40;
  const radius = size / 2 - pad;
  const c = size / 2;

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const at = (i: number, position: number) => {
    const d = (radius * Math.max(MIN_DRAWN, Math.min(100, position))) / 100;
    return [c + d * Math.cos(angle(i)), c + d * Math.sin(angle(i))] as const;
  };
  const ring = (position: number) => axes.map((_, i) => at(i, position).join(",")).join(" ");
  const shape = axes.map((a, i) => at(i, a.position).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Position within the index on each chosen measure">
      {[25, 50, 75, 100].map((p) => (
        <polygon key={p} points={ring(p)} fill="none" stroke="rgb(31 41 55)" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = at(i, 100);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgb(31 41 55)" strokeWidth={1} />;
      })}

      <polygon points={shape} fill="rgba(148, 163, 184, 0.18)" stroke="rgb(148 163 184)" strokeWidth={1.5} strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = at(i, a.position);
        return (
          <circle key={i} cx={x} cy={y} r={2.5} fill="rgb(203 213 225)">
            {a.title && <title>{a.title}</title>}
          </circle>
        );
      })}

      {axes.map((a, i) => {
        const cos = Math.cos(angle(i));
        const sin = Math.sin(angle(i));
        const x = c + (radius + 10) * cos;
        const y = c + (radius + 10) * sin;
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const dy = sin > 0.3 ? 9 : sin < -0.3 ? -2 : 3;
        return (
          <text key={i} x={x} y={y + dy} textAnchor={anchor} fontSize={9.5} fill="rgb(107 114 128)">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
