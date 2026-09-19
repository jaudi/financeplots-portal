import type { PricePoint } from "@/lib/price-types";

// Portfolio maths on price series — no data access, safe in the browser and on
// the server. Used by components/PortfolioAnalysis.tsx.
//
// Weights are held constant (rebalanced every period), the usual assumption for
// portfolio risk figures. Every number is historical: nothing here forecasts.

export interface HoldingInput {
  symbol: string;
  weight: number; // any positive number; normalised to sum to 1
  points: PricePoint[];
}

export interface HoldingResult {
  symbol: string;
  weight: number;
  change_pct: number;
  annualised_pct: number | null;
  volatility_pct: number;
  max_drawdown_pct: number;
  /** Share of the portfolio's variance this holding accounts for; sums to 100 */
  risk_share_pct: number;
}

export interface PortfolioResult {
  start: string;
  end: string;
  periods: number;
  periods_per_year: number;
  /** Portfolio value, starting at 100 */
  path: { date: string; value: number }[];
  change_pct: number;
  annualised_pct: number | null;
  volatility_pct: number;
  sharpe: number | null;
  max_drawdown: { pct: number; peak: string; trough: string };
  /** Historical 95% VaR: the loss exceeded in the worst 5% of periods, as a positive percent */
  var95_pct: number;
  /** Average loss in those worst 5% of periods (expected shortfall) */
  cvar95_pct: number;
  worst_period: { pct: number; date: string };
  /** Weighted average of the holdings' volatilities, before diversification */
  undiversified_volatility_pct: number;
  holdings: HoldingResult[];
}

const YEAR_MS = 365.25 * 86_400_000;
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};
const cov = (a: number[], b: number[]) => {
  const ma = mean(a);
  const mb = mean(b);
  return a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / (a.length - 1);
};

function drawdown(values: number[], dates: string[]) {
  let peakIdx = 0;
  let worst = { pct: 0, peak: dates[0], trough: dates[0] };
  for (let i = 0; i < values.length; i++) {
    if (values[i] > values[peakIdx]) peakIdx = i;
    const dd = (values[i] / values[peakIdx] - 1) * 100;
    if (dd < worst.pct) worst = { pct: dd, peak: dates[peakIdx], trough: dates[i] };
  }
  return worst;
}

/**
 * @param riskFreePct annual risk-free rate in percent, for the Sharpe ratio
 * @param periodsPerYear 252 for daily closes, 52 for weekly
 */
export function analysePortfolio(holdings: HoldingInput[], riskFreePct: number, periodsPerYear: number): PortfolioResult | null {
  const total = holdings.reduce((s, h) => s + h.weight, 0);
  if (holdings.length === 0 || total <= 0) return null;
  const w = holdings.map((h) => h.weight / total);

  // Common grid: every date any holding traded, from the first date all of them
  // have a price. A market that was shut carries its last close forward.
  const start = holdings.reduce((max, h) => (h.points[0].date > max ? h.points[0].date : max), holdings[0].points[0].date);
  const dates = [...new Set(holdings.flatMap((h) => h.points.map((p) => p.date)))].filter((d) => d >= start).sort();
  if (dates.length < 21) return null;
  const closes = holdings.map((h) => {
    const out: number[] = [];
    let j = 0;
    let last = NaN;
    for (const d of dates) {
      while (j < h.points.length && h.points[j].date <= d) last = h.points[j++].close;
      out.push(last);
    }
    return out;
  });

  // Simple returns per period; the portfolio's is the weighted sum (constant weights).
  const rets = closes.map((c) => c.slice(1).map((v, i) => v / c[i] - 1));
  const n = dates.length - 1;
  const port = Array.from({ length: n }, (_, t) => rets.reduce((s, r, k) => s + w[k] * r[t], 0));

  const path = [{ date: dates[0], value: 100 }];
  for (let t = 0; t < n; t++) path.push({ date: dates[t + 1], value: path[t].value * (1 + port[t]) });

  const years = (Date.parse(dates[dates.length - 1]) - Date.parse(dates[0])) / YEAR_MS;
  const growth = path[path.length - 1].value / 100;
  // 0.98, not 1: a "1y" window runs 365 days, which is 0.9993 of a 365.25-day year
  const annualised = years >= 0.98 ? (growth ** (1 / years) - 1) * 100 : null;
  const vol = sd(port) * Math.sqrt(periodsPerYear) * 100;

  const sorted = [...port].sort((a, b) => a - b);
  const tail = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.05)));
  const worstIdx = port.indexOf(sorted[0]);

  // Risk contribution: w_i · cov(r_i, r_p) / var(r_p). The shares sum to 100%.
  const varP = sd(port) ** 2;
  const holdingResults: HoldingResult[] = holdings.map((h, k) => {
    const c = closes[k];
    const hYears = years;
    const hGrowth = c[c.length - 1] / c[0];
    return {
      symbol: h.symbol,
      weight: w[k] * 100,
      change_pct: (hGrowth - 1) * 100,
      annualised_pct: hYears >= 0.98 ? (hGrowth ** (1 / hYears) - 1) * 100 : null,
      volatility_pct: sd(rets[k]) * Math.sqrt(periodsPerYear) * 100,
      max_drawdown_pct: drawdown(c, dates).pct,
      risk_share_pct: varP > 0 ? ((w[k] * cov(rets[k], port)) / varP) * 100 : 0,
    };
  });

  return {
    start: dates[0],
    end: dates[dates.length - 1],
    periods: n,
    periods_per_year: periodsPerYear,
    path,
    change_pct: (growth - 1) * 100,
    annualised_pct: annualised,
    volatility_pct: vol,
    sharpe: annualised !== null && vol > 0 ? (annualised - riskFreePct) / vol : null,
    max_drawdown: drawdown(path.map((p) => p.value), path.map((p) => p.date)),
    var95_pct: -sorted[Math.floor(sorted.length * 0.05)] * 100,
    cvar95_pct: -mean(tail) * 100,
    worst_period: { pct: sorted[0] * 100, date: dates[worstIdx + 1] },
    undiversified_volatility_pct: holdingResults.reduce((s, h) => s + (h.weight / 100) * h.volatility_pct, 0),
    holdings: holdingResults,
  };
}
