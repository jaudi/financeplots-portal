import type { PricePoint } from "@/lib/price-types";

// Pure maths for comparing price series — no data access, safe in the browser.
// Used by components/StockComparison.tsx.

export interface SeriesStats {
  first: { date: string; close: number };
  last: { date: string; close: number };
  change_pct: number;
  /** Compound annual growth; null for periods under a year, where annualising exaggerates */
  annualised_pct: number | null;
  volatility_pct: number | null;
  max_drawdown: { pct: number; peak: string; trough: string } | null;
}

const YEAR_MS = 365.25 * 86_400_000;

/** Latest date on which every series has a price — the fair common starting point. */
export function commonStart(series: PricePoint[][]): string {
  return series.reduce((max, s) => (s[0].date > max ? s[0].date : max), series[0][0].date);
}

export function seriesStats(points: PricePoint[], periodsPerYear: number): SeriesStats {
  const first = points[0];
  const last = points[points.length - 1];
  const years = (Date.parse(last.date) - Date.parse(first.date)) / YEAR_MS;

  let volatility: number | null = null;
  if (points.length > 20) {
    const rets = points.slice(1).map((p, i) => Math.log(p.close / points[i].close));
    const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
    const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / (rets.length - 1);
    volatility = Math.sqrt(variance * periodsPerYear) * 100;
  }

  let peak = first;
  let worst: SeriesStats["max_drawdown"] = null;
  for (const p of points) {
    if (p.close > peak.close) peak = p;
    const dd = (p.close / peak.close - 1) * 100;
    if (dd < (worst?.pct ?? 0)) worst = { pct: dd, peak: peak.date, trough: p.date };
  }

  return {
    first: { date: first.date, close: first.close },
    last: { date: last.date, close: last.close },
    change_pct: (last.close / first.close - 1) * 100,
    // 0.98, not 1: a "1y" window runs 365 days, which is 0.9993 of a 365.25-day year
    annualised_pct: years >= 0.98 ? ((last.close / first.close) ** (1 / years) - 1) * 100 : null,
    volatility_pct: volatility,
    max_drawdown: worst,
  };
}

/**
 * One row per date on which any series traded, each series rebased to 100 at
 * the common start. A market that was closed that day carries its last close
 * forward, so lines don't break on each other's holidays.
 */
export function rebase(series: PricePoint[][]): Record<string, number | string>[] {
  const dates = [...new Set(series.flatMap((s) => s.map((p) => p.date)))].sort();
  const idx = series.map(() => 0);
  const lastClose: (number | null)[] = series.map(() => null);
  return dates.map((date) => {
    const row: Record<string, number | string> = { date };
    series.forEach((s, k) => {
      while (idx[k] < s.length && s[idx[k]].date <= date) lastClose[k] = s[idx[k]++].close;
      const c = lastClose[k];
      if (c !== null) row[`s${k}`] = Math.round((c / s[0].close) * 10000) / 100;
    });
    return row;
  });
}

/** Pearson correlation of period returns, on the dates both series actually traded. */
export function correlation(a: PricePoint[], b: PricePoint[]): number | null {
  const bByDate = new Map(b.map((p) => [p.date, p.close]));
  const shared = a.filter((p) => bByDate.has(p.date));
  if (shared.length < 21) return null;
  const ra: number[] = [];
  const rb: number[] = [];
  for (let i = 1; i < shared.length; i++) {
    ra.push(Math.log(shared[i].close / shared[i - 1].close));
    rb.push(Math.log(bByDate.get(shared[i].date)! / bByDate.get(shared[i - 1].date)!));
  }
  const n = ra.length;
  const ma = ra.reduce((s, x) => s + x, 0) / n;
  const mb = rb.reduce((s, x) => s + x, 0) / n;
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i++) {
    cov += (ra[i] - ma) * (rb[i] - mb);
    va += (ra[i] - ma) ** 2;
    vb += (rb[i] - mb) ** 2;
  }
  return va && vb ? cov / Math.sqrt(va * vb) : null;
}
