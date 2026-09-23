import { formatValue, type ChartSpec } from "@/lib/charts/spec";

// Turns a ChartSpec into positioned shapes and text for a given size and
// theme. Pure arithmetic: the PNG renderer and the MCP App view both draw the
// Scene this returns, so they can't drift apart.
//
// Mark specs follow the dataviz reference: bars at most 24px wide with a 4px
// rounded data end and square base, a 2px surface gap between stacked
// segments, 2px lines, 8px end dots with a 2px surface ring, hairline solid
// gridlines, a legend for two or more series, labels in text colours only.

export interface Theme {
  name: "dark" | "light";
  bg: string;
  text: string;
  text2: string;
  muted: string;
  grid: string;
  axis: string;
  /** Categorical slots, in fixed order (validated for CVD on this surface). */
  series: string[];
}

export const THEMES: Record<"dark" | "light", Theme> = {
  dark: {
    name: "dark",
    bg: "#0d1426",
    text: "#e2e8f0",
    text2: "#94a3b8",
    muted: "#64748b",
    grid: "#1e293b",
    axis: "#334155",
    series: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
  },
  light: {
    name: "light",
    bg: "#ffffff",
    text: "#0f172a",
    text2: "#475569",
    muted: "#94a3b8",
    grid: "#e2e8f0",
    axis: "#cbd5e1",
    series: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  },
};

export type Shape =
  | { t: "path"; d: string; fill?: string; stroke?: string; width?: number; opacity?: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; width: number; opacity?: number }
  | { t: "circle"; cx: number; cy: number; r: number; fill: string; stroke?: string; width?: number };

/** `y` is the vertical centre of the text. */
export interface TextItem {
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  anchor: "start" | "middle" | "end";
  weight?: 400 | 600;
}

/** One hover band per x label, with every series' value there. */
export interface Hit {
  index: number;
  x: number;
  w: number;
  cx: number;
  label: string;
  rows: { name: string; value: string; color: string; y: number | null }[];
}

export interface Scene {
  width: number;
  height: number;
  theme: Theme;
  plot: { x: number; y: number; w: number; h: number };
  shapes: Shape[];
  texts: TextItem[];
  hits: Hit[];
}

/** Rough text width for layout; generous so labels never collide. */
export const textWidth = (s: string, size: number) => s.length * size * 0.58;

function niceStep(raw: number) {
  if (!(raw > 0)) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw * 0.999) ?? raw;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A bar with a rounded data end (top when rising, bottom when falling) and a square base. */
function barPath(x: number, yTop: number, w: number, h: number, round: "top" | "bottom" | "none") {
  const r = round === "none" ? 0 : Math.min(4, h, w / 2);
  const [X, Y, W, H] = [r1(x), r1(yTop), r1(w), r1(h)];
  if (r <= 0.5) return `M${X},${Y}h${W}v${H}h${-W}Z`;
  return round === "top"
    ? `M${X},${Y + H}V${Y + r}Q${X},${Y} ${X + r},${Y}H${X + W - r}Q${X + W},${Y} ${X + W},${Y + r}V${Y + H}Z`
    : `M${X},${Y}V${Y + H - r}Q${X},${Y + H} ${X + r},${Y + H}H${X + W - r}Q${X + W},${Y + H} ${X + W},${Y + H - r}V${Y}Z`;
}

export function layoutChart(spec: ChartSpec, opts: { width: number; height: number; theme: Theme }): Scene {
  const { width, height, theme } = opts;
  const shapes: Shape[] = [];
  const texts: TextItem[] = [];
  const fmt = (v: number | null, style: "compact" | "full" = "compact") => formatValue(v, spec.y.format, spec.y.currency, style);
  const color = (i: number) => theme.series[(spec.series[i].slot ?? i) % theme.series.length];
  const n = spec.x.labels.length;
  const pad = 20;

  // ── Header and legend ──
  let top = 16;
  texts.push({ x: pad, y: top + 10, text: spec.title, size: 17, color: theme.text, anchor: "start", weight: 600 });
  top += 26;
  if (spec.subtitle) {
    texts.push({ x: pad, y: top + 8, text: spec.subtitle, size: 13, color: theme.text2, anchor: "start" });
    top += 22;
  }
  if (spec.series.length >= 2) {
    let lx = pad;
    top += 6;
    spec.series.forEach((s, i) => {
      const w = 18 + s.name.length * 12 * 0.52 + 18;
      if (lx + w > width - pad && lx > pad) {
        lx = pad;
        top += 20;
      }
      if (s.type === "bar") shapes.push({ t: "path", d: barPath(lx, top + 3, 10, 10, "none"), fill: color(i) });
      else shapes.push({ t: "line", x1: lx, y1: top + 8, x2: lx + 12, y2: top + 8, stroke: color(i), width: s.thin ? 1.5 : 2.5 });
      texts.push({ x: lx + 18, y: top + 8, text: s.name, size: 12, color: theme.text2, anchor: "start" });
      lx += w;
    });
    top += 20;
  }
  top += 14;

  const bottom = height - (spec.note ? 22 : 6) - 26;

  // ── Y domain ──
  const hasBars = spec.series.some((s) => s.type === "bar");
  const hasArea = spec.series.some((s) => s.type === "area");
  const zeroBased = spec.y.zeroBased ?? (hasBars || hasArea);
  let lo = Infinity;
  let hi = -Infinity;
  const widen = (v: number) => {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  };
  const stacks = new Map<string, number[]>(); // series indices per stack
  spec.series.forEach((s, i) => {
    if (s.type !== "bar") {
      for (const v of s.values) if (v !== null) widen(v);
      return;
    }
    const key = s.stack ?? `__bar${i}`;
    stacks.set(key, [...(stacks.get(key) ?? []), i]);
  });
  for (const members of stacks.values()) {
    for (let x = 0; x < n; x++) {
      let pos = 0;
      let neg = 0;
      for (const i of members) {
        const v = spec.series[i].values[x];
        if (v === null || v === undefined) continue;
        if (v >= 0) pos += v;
        else neg += v;
      }
      widen(neg);
      widen(pos);
    }
  }
  for (const r of spec.refLines ?? []) widen(r.value);
  if (!Number.isFinite(lo)) {
    widen(0);
    widen(1);
  }
  if (zeroBased) widen(0);
  else {
    const padY = (hi - lo || Math.abs(hi) || 1) * 0.06;
    lo -= padY;
    hi += padY;
  }
  if (hi === lo) hi = lo + 1;
  const step = niceStep((hi - lo) / 4);
  const yMin = Math.floor(lo / step + 1e-9) * step;
  const yMax = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step * 0.5; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);

  // ── Plot area ──
  const yLabelW = Math.max(...ticks.map((t) => textWidth(fmt(t), 11)));
  const lineSeries = spec.series.map((s, i) => ({ s, i })).filter(({ s }) => s.type !== "bar");
  const endLabels = lineSeries.length > 0 && lineSeries.length <= 3;
  const plot = { x: pad + yLabelW + 10, y: top, w: 0, h: bottom - top };
  plot.w = width - pad - (endLabels ? 58 : 4) - plot.x;
  const Y = (v: number) => plot.y + plot.h - ((v - yMin) / (yMax - yMin)) * plot.h;
  const band = plot.w / Math.max(n, 1);
  const CX = (i: number) => plot.x + band * (i + 0.5);

  for (const t of ticks) {
    const y = Y(t);
    shapes.push({ t: "line", x1: plot.x, y1: y, x2: plot.x + plot.w, y2: y, stroke: t === 0 && yMin < 0 ? theme.axis : theme.grid, width: 1 });
    texts.push({ x: plot.x - 8, y, text: fmt(t), size: 11, color: theme.muted, anchor: "end" });
  }

  // X labels: the requested ticks (or every index), skipping any that would
  // touch the one before, and never running off the plot.
  const candidates = spec.x.ticks ?? spec.x.labels.map((_, i) => i);
  const labelW = Math.max(...candidates.map((i) => textWidth(spec.x.labels[i] ?? "", 11))) + 10;
  const every = spec.x.ticks ? 1 : Math.max(1, Math.ceil((labelW * n) / plot.w));
  let lastRight = -Infinity;
  candidates.forEach((i, k) => {
    if (k % every !== 0 || i < 0 || i >= n) return;
    const w = textWidth(spec.x.labels[i], 11);
    const x = Math.min(Math.max(CX(i), plot.x + w / 2), plot.x + plot.w - w / 2);
    if (x - w / 2 < lastRight + 8) return;
    lastRight = x + w / 2;
    texts.push({ x, y: plot.y + plot.h + 14, text: spec.x.labels[i], size: 11, color: theme.muted, anchor: "middle" });
  });
  if (spec.x.title) texts.push({ x: plot.x + plot.w, y: plot.y + plot.h + 30, text: spec.x.title, size: 11, color: theme.muted, anchor: "end" });

  // ── Bars ──
  const groups = [...stacks.values()];
  if (groups.length) {
    const gap = 2;
    const barW = Math.max(2, Math.min(24, (band * 0.72 - gap * (groups.length - 1)) / groups.length));
    const groupW = barW * groups.length + gap * (groups.length - 1);
    const soloBar = groups.length === 1 && groups[0].length === 1 && n <= 12;
    for (let x = 0; x < n; x++) {
      groups.forEach((members, g) => {
        const bx = CX(x) - groupW / 2 + g * (barW + gap);
        const segs: { i: number; from: number; to: number }[] = [];
        let pos = 0;
        let neg = 0;
        for (const i of members) {
          const v = spec.series[i].values[x];
          if (v === null || v === undefined || v === 0) continue;
          if (v > 0) segs.push({ i, from: pos, to: (pos += v) });
          else segs.push({ i, from: neg, to: (neg += v) });
        }
        const lastPos = segs.filter((s) => s.to > 0).at(-1);
        const lastNeg = segs.filter((s) => s.to < 0).at(-1);
        for (const s of segs) {
          const up = s.to > 0;
          const first = s.from === 0;
          let y0 = Y(s.from);
          const y1 = Y(s.to);
          if (!first) y0 += up ? -gap : gap; // the surface gap between stacked segments
          const yTop = Math.min(y0, y1);
          const h = Math.abs(y1 - y0);
          if (h < 0.5) continue;
          const round = s === lastPos ? "top" : s === lastNeg ? "bottom" : "none";
          shapes.push({ t: "path", d: barPath(bx, yTop, barW, h, round), fill: color(s.i) });
        }
        if (soloBar && segs.length) {
          const v = segs[0].to;
          texts.push({ x: bx + barW / 2, y: v >= 0 ? Y(v) - 10 : Y(v) + 10, text: fmt(v), size: 11, color: theme.text2, anchor: "middle" });
        }
      });
    }
  }

  // ── Lines and areas ──
  const ends: { y: number; text: string }[] = [];
  for (const { s, i } of lineSeries) {
    const pts = s.values.map((v, x) => (v === null ? null : ([CX(x), Y(v)] as const)));
    let d = "";
    let run: (readonly [number, number])[] = [];
    const flush = () => {
      if (run.length === 0) return;
      const line = run.map(([x, y], k) => `${k ? "L" : "M"}${r1(x)},${r1(y)}`).join("");
      if (s.type === "area") {
        const base = r1(Y(Math.max(yMin, 0)));
        shapes.push({ t: "path", d: `${line}L${r1(run.at(-1)![0])},${base}L${r1(run[0][0])},${base}Z`, fill: color(i), opacity: 0.1 });
      }
      d += line;
      run = [];
    };
    for (const p of pts) {
      if (p) run.push(p);
      else flush();
    }
    flush();
    shapes.push({ t: "path", d, stroke: color(i), width: s.thin ? 1.5 : 2, opacity: s.thin ? 0.85 : 1 });
    const lastX = s.values.findLastIndex((v) => v !== null);
    if (lastX >= 0 && !s.thin) {
      const [ex, ey] = pts[lastX]!;
      shapes.push({ t: "circle", cx: ex, cy: ey, r: 4, fill: color(i), stroke: theme.bg, width: 2 });
      if (endLabels) ends.push({ y: ey, text: fmt(s.values[lastX]) });
    }
  }
  // End labels only when they don't collide; otherwise the legend and tooltip carry them.
  const sortedEnds = [...ends].sort((a, b) => a.y - b.y);
  if (sortedEnds.every((e, k) => k === 0 || e.y - sortedEnds[k - 1].y >= 14)) {
    for (const e of ends) texts.push({ x: plot.x + plot.w + 10, y: e.y, text: e.text, size: 11, color: theme.text, anchor: "start", weight: 600 });
  }

  // ── Reference lines and markers ──
  for (const r of spec.refLines ?? []) {
    const y = Y(r.value);
    shapes.push({ t: "line", x1: plot.x, y1: y, x2: plot.x + plot.w, y2: y, stroke: theme.text2, width: 1, opacity: 0.7 });
    texts.push({ x: plot.x + plot.w, y: y - 9, text: `${r.label} ${fmt(r.value)}`, size: 11, color: theme.text2, anchor: "end" });
  }
  // Marker labels sit above the plot; one that would overlap the previous
  // drops to a second row just inside it.
  const placed: { l: number; r: number; row: number }[] = [];
  for (const m of spec.markers ?? []) {
    if (m.index < 0 || m.index > n - 1) continue;
    const x = CX(m.index);
    shapes.push({ t: "line", x1: x, y1: plot.y, x2: x, y2: plot.y + plot.h, stroke: theme.text2, width: 1, opacity: 0.7 });
    const w = textWidth(m.label, 11);
    const lx = Math.min(Math.max(x, plot.x + w / 2), plot.x + plot.w - w / 2);
    const row = placed.some((p) => p.row === 0 && lx - w / 2 < p.r + 8 && lx + w / 2 > p.l - 8) ? 1 : 0;
    placed.push({ l: lx - w / 2, r: lx + w / 2, row });
    texts.push({ x: lx, y: row === 0 ? plot.y - 8 : plot.y + 10, text: m.label, size: 11, color: theme.text2, anchor: "middle" });
  }

  if (spec.note) texts.push({ x: pad, y: height - 14, text: spec.note, size: 11, color: theme.muted, anchor: "start" });

  // ── Hover bands ──
  const hits: Hit[] = spec.x.labels.map((label, x) => ({
    index: x,
    x: plot.x + band * x,
    w: band,
    cx: CX(x),
    label,
    rows: spec.series.map((s, i) => {
      const v = s.values[x] ?? null;
      return { name: s.name, value: fmt(v, "full"), color: color(i), y: v === null || s.type === "bar" ? null : Y(v) };
    }),
  }));

  return { width, height, theme, plot, shapes, texts, hits };
}
