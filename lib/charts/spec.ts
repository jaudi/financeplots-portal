// A chart described as data. The MCP tools build these from their results;
// lib/charts/layout.ts turns one into positioned shapes and text, which
// lib/charts/png.tsx rasterises for any client and mcp-app/chart-view.ts draws
// live (with tooltips) in clients that support MCP Apps. One description, one
// layout, two renderings — so the picture and the interactive view match.
//
// No DOM and no Node APIs here or in layout.ts: both run in the browser too.

export type ValueFormat = "money" | "pct" | "index" | "number" | "units";

export interface ChartSeries {
  name: string;
  type: "bar" | "line" | "area";
  /** One value per x label; null leaves a gap. */
  values: (number | null)[];
  /** Bars with the same stack id are stacked; others sit side by side. */
  stack?: string;
  /** Categorical palette slot, 0-based. Defaults to the series' position, so a
   *  series keeps its colour whatever else is shown (never by rank or value). */
  slot?: number;
  /** Draw a thin reference-style line (e.g. a 200-day average). */
  thin?: boolean;
}

export interface ChartSpec {
  title: string;
  subtitle?: string;
  /** `ticks`: indices to label (e.g. month starts); the layout thins them to fit. Default: evenly spaced. */
  x: { labels: string[]; title?: string; ticks?: number[] };
  y: { format: ValueFormat; currency?: string; title?: string; zeroBased?: boolean };
  series: ChartSeries[];
  /** Horizontal lines, e.g. an average. */
  refLines?: { value: number; label: string }[];
  /** Vertical markers at an x index (may be fractional), e.g. the break-even point. */
  markers?: { index: number; label: string }[];
  /** Small print under the chart. */
  note?: string;
}

/** Key under which a tool result's `_meta` carries its charts for the MCP App view. */
export const CHARTS_META_KEY = "financeplots/charts";

// ── Formatting ──────────────────────────────────────────────────────────────

const SYMBOLS: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", JPY: "¥" };

/** Compact number: 1,284 · 12.9k · 4.2M · 1.1bn. */
export function compact(n: number): string {
  const a = Math.abs(n);
  if (a === 0) return "0";
  const sign = n < 0 ? "−" : "";
  const trim = (s: string) => (s.includes(".") ? s.replace(/\.?0+$/, "") : s);
  if (a >= 1e9) return `${sign}${trim((a / 1e9).toFixed(1))}bn`;
  if (a >= 1e6) return `${sign}${trim((a / 1e6).toFixed(1))}M`;
  if (a >= 1e4) return `${sign}${Math.round(a / 1e3)}k`;
  if (a >= 1e3) return `${sign}${trim((a / 1e3).toFixed(1))}k`;
  if (a >= 100) return `${sign}${Math.round(a)}`;
  return `${sign}${trim(a.toFixed(a >= 10 ? 1 : 2))}`;
}

/** Full number with thousands separators, for tooltips and tables. */
export function full(n: number, format: ValueFormat): string {
  const dp = format === "units" ? 0 : format === "pct" || format === "index" ? 1 : Math.abs(n) < 100 ? 2 : 0;
  const s = Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: dp === 2 ? 2 : 0, maximumFractionDigits: dp });
  return (n < 0 ? "−" : "") + s;
}

export function formatValue(n: number | null, format: ValueFormat, currency?: string, style: "compact" | "full" = "compact"): string {
  if (n === null || !Number.isFinite(n)) return "n/a";
  const body = style === "compact" && format !== "units" ? compact(n) : full(n, format);
  if (format === "pct") return `${body}%`;
  if (format === "money" && currency) {
    const sym = SYMBOLS[currency.toUpperCase()];
    if (sym) return body.startsWith("−") ? `−${sym}${body.slice(1)}` : `${sym}${body}`;
    return `${body} ${currency}`;
  }
  return body;
}
