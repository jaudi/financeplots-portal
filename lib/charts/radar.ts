import { textWidth, type Scene, type Shape, type TextItem, type Theme } from "@/lib/charts/layout";

// The snowflake as a chart spec: every ratio of one or more companies as a
// spoke, flat or tilted into 3D. Laid out here as a Scene, like the other
// charts, so the PNG (flat) and the MCP App view (3D, turnable) draw the same
// geometry. Pure arithmetic: no DOM, no Node.
//
// Same rules as the snowflake on the company pages (UK MAR, CLAUDE.md):
// - A point's distance from the centre is the share of the company's index with
//   a LOWER figure. Further out = higher, never better; no axis is inverted.
// - No area, total, group score or rank. Colours follow layer position, the
//   way series colours do in every other chart — never the figures.
// - A missing figure is left out of the outline, not drawn as a zero.

export interface RadarSpec {
  kind: "radar";
  title: string;
  subtitle?: string;
  spokes: { label: string; group: string }[];
  /** One per company, in the order asked for. */
  layers: {
    name: string;
    /** Where its positions are measured, e.g. "S&P 500". */
    within: string;
    /** 0–100 per spoke: the share of the index with a lower figure. */
    positions: (number | null)[];
    /** The figure per spoke, formatted with its unit. */
    values: string[];
  }[];
  note?: string;
}

/** A drawn point, for hit-testing in the interactive view. */
export interface RadarNode {
  layer: number;
  spoke: number;
  x: number;
  y: number;
}

export interface RadarView {
  /** Turn around the vertical axis, radians. */
  yaw: number;
  /** Tilt towards the viewer, radians: 0 is flat (looking straight down). */
  pitch: number;
}

export const FLAT: RadarView = { yaw: 0, pitch: 0 };
export const TILTED: RadarView = { yaw: -0.5, pitch: 0.8 };

const MIN_DRAWN = 3; // a figure at the very bottom of the index stays visible

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Closed Catmull-Rom curve through the points, as an SVG path. */
export function smoothPath(pts: [number, number][]) {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M${r1(p(0)[0])},${r1(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const t = 0.16;
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) * t)},${r1(p1[1] + (p2[1] - p0[1]) * t)} ${r1(p2[0] - (p3[0] - p1[0]) * t)},${r1(p2[1] - (p3[1] - p1[1]) * t)} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d + "Z";
}

export function layoutRadar(
  spec: RadarSpec,
  opts: { width: number; height: number; theme: Theme; view?: RadarView; selected?: { layer: number; spoke: number } | null },
): Scene & { nodes: RadarNode[] } {
  const { width, height, theme } = opts;
  const view = opts.view ?? FLAT;
  const shapes: Shape[] = [];
  const texts: TextItem[] = [];
  const nodes: RadarNode[] = [];
  const pad = 20;
  const colour = (li: number) => theme.series[li % theme.series.length];
  const n = spec.spokes.length;

  // ── Header and legend ──
  let top = 16;
  texts.push({ x: pad, y: top + 10, text: spec.title, size: 17, color: theme.text, anchor: "start", weight: 600 });
  top += 26;
  if (spec.subtitle) {
    texts.push({ x: pad, y: top + 8, text: spec.subtitle, size: 13, color: theme.text2, anchor: "start" });
    top += 22;
  }
  if (spec.layers.length >= 2) {
    let lx = pad;
    top += 6;
    spec.layers.forEach((l, li) => {
      const label = `${l.name} (vs ${l.within})`;
      const w = 18 + textWidth(label, 12) + 14;
      if (lx + w > width - pad && lx > pad) {
        lx = pad;
        top += 20;
      }
      shapes.push({ t: "circle", cx: lx + 5, cy: top + 8, r: 5, fill: colour(li) });
      texts.push({ x: lx + 16, y: top + 8, text: label, size: 12, color: theme.text2, anchor: "start" });
      lx += w;
    });
    top += 20;
  }
  const bottom = height - (spec.note ? 26 : 8);
  if (spec.note) texts.push({ x: pad, y: height - 13, text: spec.note, size: 11, color: theme.muted, anchor: "start" });

  const plot = { x: pad, y: top, w: width - 2 * pad, h: Math.max(60, bottom - top) };
  if (n < 3) return { width, height, theme, plot, shapes, texts, hits: [], nodes };

  // ── Geometry ──
  const tilt = Math.min(1, view.pitch / TILTED.pitch); // 0 flat … 1 fully 3D
  const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
  const single = spec.layers.length === 1;
  const layers = spec.layers.length;
  // Height of the stack above the floor, as a multiple of R: one company's
  // points rise up to 0.85 R; several companies are layers 0.33 R apart.
  const stack = (single ? 0.85 : 0.2 + (layers - 1) * 0.33) * tilt;
  // Fit the tilted floor (labels reach R + 50) plus the stack into the plot,
  // and leave ≈ 75px either side for spoke labels.
  const R = Math.max(
    30,
    Math.min((plot.w - 150) / 2, (plot.h - 100 * cp - 10) / (2 * cp + stack * sp)) * 0.92,
  );
  const peak = R * 0.85;
  const gap = R * 0.33;
  const base = -((layers - 1) * gap) / 2;
  const floorZ = single ? (-peak / 2) * tilt : (base - R * 0.2) * tilt;
  const topZ = floorZ + stack * R;
  const cx = plot.x + plot.w / 2;
  // Centre the whole stack, not just the floor.
  const cy = plot.y + plot.h / 2 + ((floorZ + topZ) / 2) * sp;

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const clamp = (p: number) => Math.max(MIN_DRAWN, Math.min(100, p));
  const elev = (li: number, p: number | null) => (single ? floorZ + (clamp(p ?? 0) / 100) * peak * tilt : (base + li * gap) * tilt);

  const project = (x: number, y: number, z: number): [number, number] => {
    const cyw = Math.cos(view.yaw), syw = Math.sin(view.yaw);
    const x1 = x * cyw - y * syw;
    const y1 = x * syw + y * cyw;
    const y2 = y1 * cp - z * sp;
    const depth = y1 * sp + z * cp;
    const f = 900 / (900 - depth * 0.6);
    return [r1(cx + x1 * f), r1(cy + y2 * f)];
  };
  const at = (i: number, position: number, z: number, scale = 1) => {
    const d = ((R * position) / 100) * scale;
    return project(d * Math.cos(angle(i)), d * Math.sin(angle(i)), z);
  };

  // ── Floor: rings, spokes, group arcs and labels ──
  for (const p of [25, 50, 75, 100]) {
    const ring = spec.spokes.map((_, i) => at(i, p, floorZ));
    shapes.push({ t: "path", d: `M${ring.map((q) => q.join(",")).join("L")}Z`, fill: p === 100 ? theme.grid : undefined, opacity: p === 100 ? 0.35 : undefined, stroke: theme.grid, width: 1 });
  }
  const [ox, oy] = project(0, 0, floorZ);
  spec.spokes.forEach((_, i) => {
    const [x, y] = at(i, 100, floorZ);
    shapes.push({ t: "line", x1: ox, y1: oy, x2: x, y2: y, stroke: theme.grid, width: 1 });
  });

  const groups: { name: string; from: number; to: number }[] = [];
  spec.spokes.forEach((s, i) => {
    const g = groups[groups.length - 1];
    if (g && g.name === s.group) g.to = i;
    else groups.push({ name: s.group, from: i, to: i });
  });
  for (const g of groups) {
    const a0 = angle(g.from) - Math.PI / n + 0.06, a1 = angle(g.to) + Math.PI / n - 0.06;
    const pts: [number, number][] = [];
    for (let k = 0; k <= 16; k++) {
      const a = a0 + ((a1 - a0) * k) / 16;
      pts.push(project((R + 30) * Math.cos(a), (R + 30) * Math.sin(a), floorZ));
    }
    shapes.push({ t: "path", d: `M${pts.map((q) => q.join(",")).join("L")}`, stroke: theme.series[0], width: 2, opacity: 0.45 });
    // Between two spokes, so the group name never sits on a spoke's label: a
    // group with an odd number of spokes has one in the middle, so step half a gap.
    const am = (a0 + a1) / 2 + ((g.to - g.from) % 2 === 0 ? Math.PI / n : 0);
    const [mx, my] = project((R + 46) * Math.cos(am), (R + 46) * Math.sin(am), floorZ);
    const label = g.name.toUpperCase();
    const w = textWidth(label, 10);
    texts.push({ x: Math.max(4 + w / 2, Math.min(width - 4 - w / 2, mx)), y: my, text: label, size: 10, color: theme.series[0], anchor: "middle", weight: 600 });
  }
  spec.spokes.forEach((s, i) => {
    const [x, y] = at(i, 100, floorZ, 1.14);
    const sel = opts.selected?.spoke === i;
    texts.push({ x, y, text: s.label, size: 10, color: sel ? theme.text : theme.muted, anchor: "middle", weight: sel ? 600 : 400 });
  });

  // ── One shape per company, lowest layer first ──
  spec.layers.forEach((layer, li) => {
    const c = colour(li);
    const pts = layer.positions.map((p, i) => at(i, clamp(p ?? 0), elev(li, p)));
    const known = layer.positions.flatMap((p, i) => (p === null ? [] : [i]));
    if (known.length >= 3) {
      if (single && tilt > 0.05) {
        shapes.push({ t: "path", d: smoothPath(known.map((i) => at(i, clamp(layer.positions[i]!), floorZ))), fill: c, opacity: 0.07 });
      }
      if (tilt > 0.05) {
        for (const i of known) {
          const [fx, fy] = at(i, clamp(layer.positions[i]!), floorZ);
          shapes.push({ t: "line", x1: pts[i][0], y1: pts[i][1], x2: fx, y2: fy, stroke: c, width: 1, opacity: 0.3 });
        }
      }
      shapes.push({ t: "path", d: smoothPath(known.map((i) => pts[i])), fill: c, opacity: spec.layers.length > 1 ? 0.16 : 0.22 });
      shapes.push({ t: "path", d: smoothPath(known.map((i) => pts[i])), stroke: c, width: 2 });
    }
    layer.positions.forEach((p, i) => {
      const sel = opts.selected?.layer === li && opts.selected.spoke === i;
      shapes.push({ t: "circle", cx: pts[i][0], cy: pts[i][1], r: sel ? 5.5 : 3.5, fill: p === null ? theme.bg : c, stroke: sel ? theme.text : c, width: sel ? 2 : 1.25 });
      nodes.push({ layer: li, spoke: i, x: pts[i][0], y: pts[i][1] });
    });
  });

  return { width, height, theme, plot, shapes, texts, hits: [], nodes };
}

/** "higher than 98% of the S&P 500", or why there is no point. */
export function positionText(spec: RadarSpec, layer: number, spoke: number) {
  const l = spec.layers[layer];
  const p = l.positions[spoke];
  return p === null ? "no figure reported" : `higher than ${Math.round(p)}% of the ${l.within}`;
}
