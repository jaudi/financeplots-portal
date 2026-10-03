import { takeHomePay, type CompoundRow, type TakeHomeInputs } from "@/lib/calculators";
import { formatValue, type ChartSpec } from "@/lib/charts/spec";
import type { RadarSpec } from "@/lib/charts/radar";
import { INDEX_LABELS, type CompanyProfile } from "@/lib/company";
import type { PricePoint } from "@/lib/price-types";
import { formatMetric } from "@/lib/stock-metrics";

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

/** Where each pound of salary goes, at salaries around the user's, with a
 *  marker on theirs. Series keep their slots whatever the inputs. */
export function takeHomeChart(v: TakeHomeInputs): ChartSpec {
  const gross = Math.max(0, v.grossSalary);
  const top = Math.max(40_000, gross * 2);
  const mag = 10 ** Math.floor(Math.log10(top / 10));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= top / 10) ?? top / 10;
  const grid = Array.from({ length: Math.ceil(top / step) + 1 }, (_, i) => i * step);
  const rows = grid.map((g) => takeHomePay({ ...v, grossSalary: g }));
  const anyLoan = rows.some((r) => r.studentLoan + r.postgradLoan > 0);
  const anyPension = rows.some((r) => r.pensionFromPay > 0);
  return {
    title: "Where the salary goes",
    subtitle: `UK ${v.region === "scotland" ? "(Scotland)" : "(England, Wales, NI)"} · tax year 2026/27, per year`,
    x: { labels: grid.map((g) => formatValue(g, "money", "GBP")), title: "Gross salary" },
    y: { format: "money", currency: "GBP", zeroBased: true },
    series: [
      { name: "Take-home", type: "bar", stack: "s", slot: 0, values: rows.map((r) => r.takeHome) },
      { name: "Income tax", type: "bar", stack: "s", slot: 1, values: rows.map((r) => r.incomeTax) },
      { name: "National Insurance", type: "bar", stack: "s", slot: 2, values: rows.map((r) => r.nationalInsurance) },
      ...(anyLoan ? [{ name: "Student loan", type: "bar" as const, stack: "s", slot: 3, values: rows.map((r) => r.studentLoan + r.postgradLoan) }] : []),
      ...(anyPension ? [{ name: "Pension", type: "bar" as const, stack: "s", slot: 4, values: rows.map((r) => r.pensionFromPay) }] : []),
    ],
    markers: gross > 0 ? [{ index: gross / step, label: `You: ${formatValue(gross, "money", "GBP")}` }] : [],
    note: `${SOURCE} · standard tax code 1257L`,
  };
}

/** Company history from annual reports: revenue and net profit by fiscal year. */
export function companyHistoryChart(name: string, years: { end: string; revenue: number | null; netIncome: number | null }[]): ChartSpec {
  const hasRevenue = years.some((y) => y.revenue !== null);
  return {
    title: `${name}: ${hasRevenue ? "revenue and net profit" : "net profit"}`,
    subtitle: `Fiscal years ${years[0].end.slice(0, 4)}–${years.at(-1)!.end.slice(0, 4)}, as reported (10-K)`,
    x: { labels: years.map((y) => `FY${y.end.slice(0, 4)}`), title: "Fiscal year" },
    y: { format: "money", currency: "USD" },
    series: [
      ...(hasRevenue ? [{ name: "Revenue", type: "bar" as const, slot: 0, values: years.map((y) => y.revenue) }] : []),
      { name: "Net profit", type: "bar" as const, slot: 1, values: years.map((y) => y.netIncome) },
    ],
    note: `${SOURCE} · SEC EDGAR`,
  };
}

/** The snowflake: every ratio of one company, or of two on the same shape,
 *  as positions within each company's own index. Never a score (see radar.ts). */
export function companySnowflakeChart(
  companies: { ticker: string; profile: CompanyProfile }[],
): RadarSpec {
  const measures = companies[0].profile.groups.flatMap((g) => g.measures.map((m) => ({ ...m, group: g.group })));
  const names = companies.map((c) => c.ticker).join(", ");
  return {
    kind: "radar",
    title: companies.length === 1 ? `${companies[0].profile.company.nombre} (${companies[0].ticker})` : names,
    subtitle: companies.length === 1 ? `Each ratio against the rest of the ${INDEX_LABELS[companies[0].profile.index]}` : "Each ratio against the rest of each company's own index",
    spokes: measures.map((m) => ({ label: m.metric.short, group: m.group })),
    layers: companies.map(({ ticker, profile }) => {
      const flat = profile.groups.flatMap((g) => g.measures);
      return {
        name: ticker,
        within: INDEX_LABELS[profile.index],
        positions: flat.map((m) => m.position),
        values: flat.map((m) => formatMetric(m.value, m.metric)),
      };
    }),
    note: `${SOURCE} · further out = a higher figure than more of the index, not a better one · not a score`,
  };
}
