import type { CompoundRow } from "@/lib/calculators";
import { formatValue, type ChartSpec } from "@/lib/charts/spec";
import type { PricePoint } from "@/lib/price-types";

// The chart each MCP tool returns, built from the same figures as its JSON.
// Neutral by design (see CLAUDE.md): colours follow the series' position, never
// whether a number is good or bad, and nothing is ranked.

const SOURCE = "financeplots.com";
const pct = (n: number) => `${Math.round(n * 100) / 100}%`;

export function compoundChart(rows: CompoundRow[], ratePct: number, inflationPct?: number): ChartSpec {
  return {
    title: `Compound growth at ${pct(ratePct)} a year`,
    subtitle: `${formatValue(rows.at(-1)?.portfolioValue ?? 0, "money")} after ${rows.length} years`,
    x: { labels: rows.map((r) => String(r.year)), title: "Year" },
    y: { format: "money" },
    series: [
      { name: "Contributed", type: "bar", stack: "v", values: rows.map((r) => Math.min(r.totalContributed, r.portfolioValue)) },
      { name: "Growth", type: "bar", stack: "v", values: rows.map((r) => Math.max(0, r.portfolioValue - r.totalContributed)) },
      ...(inflationPct !== undefined
        ? [{ name: `In today's money (${pct(inflationPct)} inflation)`, type: "line" as const, values: rows.map((r) => Math.round(r.portfolioValue / (1 + inflationPct / 100) ** r.year)) }]
        : []),
    ],
    note: `${SOURCE} · the return is an assumption, not a forecast`,
  };
}

export function loanCharts(yearly: { year: number; interest: number; principal: number; closing_balance: number }[], amount: number): ChartSpec[] {
  const labels = yearly.map((y) => String(y.year));
  return [
    {
      title: "Where each year's payments go",
      subtitle: "Interest and capital repaid per year",
      x: { labels, title: "Year" },
      y: { format: "money" },
      series: [
        { name: "Capital repaid", type: "bar", stack: "p", values: yearly.map((y) => y.principal) },
        { name: "Interest", type: "bar", stack: "p", values: yearly.map((y) => y.interest) },
      ],
      note: SOURCE,
    },
    {
      title: "Balance still owed",
      subtitle: `${formatValue(amount, "money")} borrowed`,
      x: { labels: ["0", ...labels], title: "Year" },
      y: { format: "money" },
      series: [{ name: "Balance", type: "area", values: [amount, ...yearly.map((y) => y.closing_balance)] }],
      note: SOURCE,
    },
  ];
}

export function breakEvenChart(fixed: number, price: number, variable: number, breakEvenUnits: number, currentUnits?: number): ChartSpec {
  const maxUnits = Math.max(breakEvenUnits * 2, (currentUnits ?? 0) * 1.25);
  // An even grid on a round step, so the lines stay straight and the axis reads
  // 0 · 500 · 1,000; markers sit at their exact value between grid points.
  const round = (raw: number) => {
    const mag = 10 ** Math.floor(Math.log10(raw || 1));
    return [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  };
  const step = Math.max(1, round(maxUnits / 40));
  const labelStep = round(maxUnits / 6);
  const steps = Math.ceil(maxUnits / step);
  const grid = Array.from({ length: steps + 1 }, (_, i) => i * step);
  const at = (u: number) => u / step; // fractional: the marker sits exactly on the value
  const markers = [{ index: at(breakEvenUnits), label: `Break-even: ${formatValue(Math.ceil(breakEvenUnits), "units")} units` }];
  if (currentUnits) markers.push({ index: at(currentUnits), label: `Now: ${formatValue(currentUnits, "units")}` });
  return {
    title: "Break-even",
    subtitle: "Revenue and total costs by units sold",
    x: { labels: grid.map((u) => formatValue(u, "units")), title: "Units", ticks: grid.map((u, i) => (u % labelStep === 0 ? i : -1)).filter((i) => i >= 0) },
    y: { format: "money", zeroBased: true },
    series: [
      { name: "Revenue", type: "line", values: grid.map((u) => u * price) },
      { name: "Total costs", type: "line", values: grid.map((u) => fixed + u * variable) },
      { name: "Fixed costs", type: "line", thin: true, values: grid.map(() => fixed) },
    ],
    markers,
    note: SOURCE,
  };
}

type MethodValues = { dcf: number | null; ev_ebitda: number | null; ev_sales: number | null; pe: number | null; average: number | null };

export function valuationChart(equity: MethodValues): ChartSpec {
  const methods = [
    ["DCF", equity.dcf],
    ["EV/EBITDA", equity.ev_ebitda],
    ["EV/Sales", equity.ev_sales],
    ["P/E", equity.pe],
  ] as const;
  return {
    title: "Equity value by method",
    subtitle: equity.average === null ? undefined : `Average of the methods shown: ${formatValue(equity.average, "money")}`,
    x: { labels: methods.map(([name, v]) => (v === null ? `${name} (n/a)` : name)) },
    y: { format: "money" },
    series: [{ name: "Equity value", type: "bar", values: methods.map(([, v]) => v) }],
    refLines: equity.average === null ? undefined : [{ value: equity.average, label: "Average" }],
    note: `${SOURCE} · n/a: the method's input is a loss · not a fairness opinion`,
  };
}

export function startupCharts(
  dcfYears: { year: number; revenue: number; fcff: number }[] | null,
  values: { label: string; value: number }[],
): ChartSpec[] {
  const charts: ChartSpec[] = [];
  if (dcfYears) {
    charts.push({
      title: "The path to maturity",
      subtitle: "Projected revenue and free cash flow to the firm",
      x: { labels: dcfYears.map((y) => String(y.year)), title: "Year" },
      y: { format: "money" },
      series: [
        { name: "Revenue", type: "line", values: dcfYears.map((y) => y.revenue) },
        { name: "Free cash flow (FCFF)", type: "bar", values: dcfYears.map((y) => y.fcff) },
      ],
      note: `${SOURCE} · Damodaran young-company DCF · assumptions, not a forecast`,
    });
  }
  if (values.length >= 2) {
    charts.push({
      title: "Value by method",
      x: { labels: values.map((v) => v.label) },
      y: { format: "money" },
      series: [{ name: "Value", type: "bar", values: values.map((v) => v.value) }],
      note: `${SOURCE} · a funding-round price is not an intrinsic value`,
    });
  }
  return charts;
}

/** Indices where a new month (or, over long ranges, a new year) starts. */
function periodStarts(dates: string[]) {
  const years = new Set(dates.map((d) => d.slice(0, 4))).size;
  const key = (d: string) => (years > 3 ? d.slice(0, 4) : d.slice(0, 7));
  return dates.map((d, i) => (i > 0 && key(d) !== key(dates[i - 1]) ? i : -1)).filter((i) => i > 0);
}

/** Month-and-year labels for a daily series; the layout thins them to fit. */
const dateLabel = (d: string, long: boolean) => {
  const [y, m, day] = d.split("-");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1];
  return long ? `${mon} ${y}` : `${Number(day)} ${mon}`;
};

export function priceChart(h: { symbol: string; name: string; currency: string; points: PricePoint[]; range: string }): ChartSpec {
  const long = h.range !== "1m";
  const hasMa = h.points.some((p) => p.ma200 !== null);
  return {
    title: `${h.name} (${h.symbol})`,
    subtitle: `Closing price, ${h.range}${h.currency ? ` · ${h.currency}` : ""}`,
    x: { labels: h.points.map((p) => dateLabel(p.date, long)), ticks: long ? periodStarts(h.points.map((p) => p.date)) : undefined },
    y: { format: "money", currency: h.currency, zeroBased: false },
    series: [
      { name: "Close", type: "area", values: h.points.map((p) => p.close) },
      ...(hasMa ? [{ name: "200-day average", type: "line" as const, thin: true, values: h.points.map((p) => p.ma200) }] : []),
    ],
    note: `${SOURCE} · Yahoo Finance, delayed · past prices say nothing about future returns`,
  };
}

export function portfolioCharts(
  path: { date: string; value: number }[],
  holdings: { symbol: string; weight: number; risk_share_pct: number }[],
  baseCurrency: string | null,
): ChartSpec[] {
  return [
    {
      title: "Portfolio value",
      subtitle: `Start = 100, weights rebalanced${baseCurrency ? ` · in ${baseCurrency}` : ""}`,
      x: { labels: path.map((p) => dateLabel(p.date, true)), ticks: periodStarts(path.map((p) => p.date)) },
      y: { format: "index", zeroBased: false },
      series: [{ name: "Portfolio", type: "area", values: path.map((p) => p.value) }],
      note: `${SOURCE} · historical, not a forecast`,
    },
    {
      title: "Weight and share of risk",
      subtitle: "A holding's share of risk can differ a lot from its weight",
      x: { labels: holdings.map((h) => h.symbol) },
      y: { format: "pct" },
      series: [
        { name: "Weight", type: "bar", values: holdings.map((h) => h.weight) },
        { name: "Share of risk", type: "bar", values: holdings.map((h) => h.risk_share_pct) },
      ],
      note: `${SOURCE} · holdings in the order given`,
    },
  ];
}
