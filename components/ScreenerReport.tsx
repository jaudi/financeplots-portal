"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RelatedTools from "@/components/RelatedTools";
import ScreenerPerformance from "@/components/ScreenerPerformance";
// `import type` so none of lib/screener's server-side fetch code follows the
// types into the client bundle.
import type { ScreenerValuation, ValuationMethod } from "@/lib/screener";

// The two screens report different columns — the quality screen has a P/E and
// an ROE, the growth screen has neither on purpose — so a row is whatever its
// pipeline wrote, read through the column descriptors below.
type Company = {
  ticker: string;
  nombre: string;
  sector: string;
} & Record<string, string | number | null | undefined>;

/** How to render one column. Plain data, no functions: these cross the server →
 *  client boundary, and the whole set has to stay serialisable. */
interface ScreenerColumn {
  key: string;
  label: string;
  numeric?: boolean;
  prefix?: string;
  suffix?: string;
  /** Prefix a "+" and colour by sign. For returns, where direction is the point. */
  signed?: boolean;
  /** Thousands separators. For the free cash flow column, which runs to six figures. */
  grouped?: boolean;
  /** Fixed decimal places. Without it JS drops trailing zeros and a column of
   *  percentages reads 129 next to 32.68. */
  decimals?: number;
  /** Pull the eye to this column. Used for the growth score. */
  emphasis?: boolean;
  /** Shown on hover, for a column whose header can't carry its own caveat. */
  title?: string;
  /** Glossary anchor. The header becomes a link to the full definition, so the
   *  explanation lives in one place instead of being paraphrased per table. */
  glossary?: string;
}

const QUALITY_COLUMNS: ScreenerColumn[] = [
  { key: "ticker", label: "Ticker" },
  { key: "nombre", label: "Name" },
  { key: "sector", label: "Sector" },
  { key: "per", label: "P/E", numeric: true, glossary: "pe-ratio" },
  { key: "roe", label: "ROE", numeric: true, glossary: "roe" },
  { key: "roa", label: "ROA", numeric: true, glossary: "roa" },
  { key: "deuda_patrimonio", label: "D/E", numeric: true, glossary: "debt-to-equity" },
  { key: "rsi", label: "RSI", numeric: true, glossary: "rsi" },
  { key: "precio_actual", label: "Price", numeric: true, prefix: "$", decimals: 2 },
  { key: "ma50", label: "MA50", numeric: true, prefix: "$", decimals: 2, glossary: "moving-average" },
];

const GROWTH_COLUMNS: ScreenerColumn[] = [
  { key: "ticker", label: "Ticker" },
  { key: "nombre", label: "Name" },
  { key: "sector", label: "Sector" },
  {
    key: "score",
    label: "Score",
    numeric: true,
    decimals: 1,
    emphasis: true,
    title:
      "Percentile rank within this week's cohort, averaged over revenue growth, earnings growth and the 6-month return. 100 is the best of the names that passed — not a quality grade, and it moves when the cohort moves.",
  },
  { key: "crecimiento_ingresos", label: "Revenue", numeric: true, suffix: "%", signed: true, decimals: 1 },
  { key: "crecimiento_beneficios", label: "Earnings", numeric: true, suffix: "%", signed: true, decimals: 1 },
  {
    key: "flujo_caja_libre",
    label: "FCF ($m)",
    numeric: true,
    grouped: true,
    glossary: "free-cash-flow",
    title: "Trailing free cash flow, in millions of the reporting currency.",
  },
  { key: "rsi", label: "RSI", numeric: true, decimals: 1, glossary: "rsi" },
  { key: "retorno_6m", label: "6M", numeric: true, suffix: "%", signed: true, decimals: 1, glossary: "momentum" },
  { key: "retorno_12m", label: "12M", numeric: true, suffix: "%", signed: true, decimals: 1, glossary: "momentum" },
  { key: "precio_actual", label: "Price", numeric: true, prefix: "$", decimals: 2 },
  { key: "ma50", label: "MA50", numeric: true, prefix: "$", decimals: 2, glossary: "moving-average" },
  { key: "ma200", label: "MA200", numeric: true, prefix: "$", decimals: 2, glossary: "moving-average" },
];

/** The growth screen's filter set, written by the pipeline into the JSON so the
 *  page can state what was actually applied instead of a copy that drifts. */
interface GrowthCriteria {
  screen?: string;
  revenue_growth_min_pct?: number;
  earnings_growth_min_pct?: number;
  free_cash_flow?: string;
  trend?: string;
  return_6m?: string;
  rsi_min?: number;
  excluded_on_purpose?: string;
  score?: string;
}

interface ScreenerReportData {
  generated_at: string | null;
  universe_size: number;
  universe_source?: string | null;
  analyzed: number;
  passed_filters: number;
  companies: Company[];
  failed: { ticker: string; error: string }[];
  report: string | null;
  criteria?: GrowthCriteria;
  valuation_method?: ValuationMethod;
  valuations?: ScreenerValuation[];
  valuation_report?: string | null;
  error?: string;
}

interface ScreenerReportProps {
  apiPath: string;
  emoji: string;
  universeName: string;
  relatedSlug: string;
  jsonLdName: string;
  jsonLdDescription: string;
  jsonLdUrl: string;
  /** Which screen this index gets. Picks the column set and the default intro. */
  variant?: "quality" | "growth";
  /** Key into performance.json — which track record belongs to this screener. */
  performanceKey: string;
  /** Whether ROA is enforced as a hard filter. Quality screens only. */
  roaRequired?: boolean;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Shared by the research report and the valuation report so the two read as one
// document. Defined at module scope, not inline, so it isn't rebuilt per render.
const markdownComponents = {
  h1: (p: object) => <h1 className="text-xl font-extrabold text-white mt-6 mb-3 first:mt-0" {...p} />,
  h2: (p: object) => <h2 className="text-lg font-bold text-white mt-6 mb-3 first:mt-0" {...p} />,
  h3: (p: object) => <h3 className="text-base font-bold text-blue-300 mt-5 mb-2" {...p} />,
  p: (p: object) => <p className="mb-4 text-gray-300" {...p} />,
  strong: (p: object) => <strong className="text-white font-semibold" {...p} />,
  ul: (p: object) => <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-300" {...p} />,
  ol: (p: object) => <ol className="list-decimal list-inside mb-4 space-y-1.5 text-gray-300" {...p} />,
  li: (p: object) => <li className="pl-1" {...p} />,
  hr: () => <hr className="border-gray-800 my-6" />,
  a: (p: object) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...p} />,
  code: (p: object) => <code className="bg-black/30 text-blue-300 px-1.5 py-0.5 rounded text-xs" {...p} />,
  table: (p: object) => (
    <div className="overflow-x-auto mb-4 border border-gray-800 rounded-lg">
      <table className="w-full text-xs" {...p} />
    </div>
  ),
  thead: (p: object) => <thead className="bg-black/20" {...p} />,
  th: (p: object) => <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-800" {...p} />,
  td: (p: object) => <td className="px-3 py-2 border-b border-gray-800/60 text-gray-300 align-top" {...p} />,
};

/** Renders one cell from its column descriptor. A missing value prints an em
 *  dash rather than "null" or a silent blank — the growth screen carries columns
 *  Yahoo doesn't always report. */
function renderCell(value: string | number | null | undefined, col: ScreenerColumn) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;

  const sign = col.signed && value > 0 ? "+" : "";
  let body: string;
  if (col.grouped) {
    body = value.toLocaleString("en-US", {
      minimumFractionDigits: col.decimals ?? 0,
      maximumFractionDigits: col.decimals ?? 0,
    });
  } else {
    body = col.decimals === undefined ? String(value) : value.toFixed(col.decimals);
  }
  return `${sign}${col.prefix ?? ""}${body}${col.suffix ?? ""}`;
}

function cellClassName(value: string | number | null | undefined, col: ScreenerColumn) {
  if (col.emphasis) return "text-white font-semibold";
  if (col.signed && typeof value === "number") {
    return value >= 0 ? "text-emerald-400" : "text-red-400";
  }
  return "text-gray-300";
}

function formatPct(value: number | null | undefined, withSign = false) {
  if (value === null || value === undefined) return "—";
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// The valuation record carries the currency its filings are in, so the DCF
// value can be labelled correctly — the IBEX names report in EUR, and showing
// a euro fair value behind a dollar sign would be wrong, not just untidy.
const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CHF: "CHF " };

function formatMoney(value: number | null, currency: string | null) {
  if (value === null) return "—";
  const symbol = CURRENCY_SYMBOLS[currency ?? "USD"] ?? `${currency} `;
  return `${symbol}${value.toFixed(2)}`;
}

/** How much weight the probability deserves. With n=3 the spread of the
 *  company's own growth is the honest guide: a steady compounder earns a real
 *  read, a cyclical whose cash flows swing by an order of magnitude does not.
 *  Above 1.0 the pipeline withholds the estimate outright, so this only ever
 *  labels numbers that were published. */
function probabilityConfidence(stdev: number | undefined) {
  if (stdev === undefined) return null;
  if (stdev < 0.2) return { label: "steady", className: "text-emerald-400/70" };
  return { label: "volatile", className: "text-amber-400/70" };
}

/** Whether the cash flows behaved like a trend. Below 0.5 nothing was projected. */
function trendQuality(r2: number | null | undefined) {
  if (r2 === null || r2 === undefined) return null;
  if (r2 >= 0.5) return { label: `R² ${r2.toFixed(2)}`, className: "text-emerald-400/70" };
  return { label: `R² ${r2.toFixed(2)} — no trend`, className: "text-gray-500" };
}

export default function ScreenerReport({
  apiPath,
  emoji,
  universeName,
  relatedSlug,
  jsonLdName,
  jsonLdDescription,
  jsonLdUrl,
  variant = "quality",
  performanceKey,
  roaRequired = true,
}: ScreenerReportProps) {
  const tc = useTranslations("toolCommon");
  const isGrowth = variant === "growth";
  const screenerLabel = isGrowth ? "Growth Screener" : "Quality Screener";
  const columns = isGrowth ? GROWTH_COLUMNS : QUALITY_COLUMNS;
  const [data, setData] = useState<ScreenerReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiPath);
        const json: ScreenerReportData = await res.json();
        if (cancelled) return;
        if (!res.ok || json.error) {
          setError(json.error ?? `Request failed (${res.status})`);
        } else {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiPath]);

  const generatedLabel = formatDate(data?.generated_at ?? null);
  const hasCompanies = (data?.companies?.length ?? 0) > 0;
  // Reports written before the reverse-DCF stage shipped have no valuation
  // block at all, so the whole section stays hidden rather than rendering empty.
  const hasValuations = (data?.valuations?.length ?? 0) > 0;

  // How much history each probability rests on. This used to print the first
  // company's count as though it spoke for the table; once the SEC filings went
  // in, depth started ranging from 3 observations to 16 in the same run, and one
  // number for all of them was simply wrong.
  const observationCounts = (data?.valuations ?? [])
    .map((v) => v.probability?.observations)
    .filter((n): n is number => typeof n === "number" && n > 0);
  const minObservations = observationCounts.length ? Math.min(...observationCounts) : 0;
  const maxObservations = observationCounts.length ? Math.max(...observationCounts) : 0;
  const observationRange =
    minObservations === maxObservations
      ? `${minObservations} annual observations here`
      : `${minObservations} to ${maxObservations} annual observations in this run`;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": jsonLdName,
          "description": jsonLdDescription,
          "url": jsonLdUrl,
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" },
        })}}
      />

      {/* Top bar */}
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/tools" className="text-gray-400 hover:text-white text-sm transition">{tc("allTools")}</Link>
          <span className="text-gray-700">|</span>
          <h1 className="text-white font-bold hidden sm:block">{emoji} {universeName} {screenerLabel}</h1>
          <span className="ml-auto text-xs text-gray-600 hidden md:block">{tc("disclaimer")}</span>
        </div>
      </div>

      <div className="pt-[109px] pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">{screenerLabel}</p>
            <h2 className="text-3xl font-extrabold text-white mb-2">{universeName} {screenerLabel}</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {isGrowth ? (
                <>
                  Every week, the full {universeName} is screened on growth (revenue and earnings both growing
                  more than 10% year on year, positive free cash flow) and momentum (price above the 50-day
                  moving average, the 50-day above the 200-day, a positive 6-month return, RSI &gt; 40). An AI
                  agent then researches the names that pass and writes an executive summary.
                </>
              ) : (
                <>
                  Every week, the full {universeName} is screened on quality fundamentals (ROE &gt; 20%
                  {roaRequired ? ", ROA > 12%" : ""}, P/E &lt; 20, Debt/Equity &lt; 100%) and momentum (RSI &gt; 30,
                  price above the 50-day moving average). An AI agent then researches the names that pass and writes
                  an executive summary.
                </>
              )}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-16 text-sm">Loading latest report…</div>
          )}

          {error && !loading && (
            <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-sm text-red-300">
              <div className="font-bold mb-1">Couldn&apos;t load the screener report</div>
              <div className="text-red-300/80">{error}</div>
            </div>
          )}

          {data && !loading && !error && (
            <>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 mb-8">
                {generatedLabel && <span>Last run: {generatedLabel}</span>}
                <span>{data.analyzed} companies analyzed</span>
                <span>{data.passed_filters} passed all filters</span>
                {data.universe_source && (
                  <span
                    className="cursor-help"
                    title="Where this run got its constituent list. A pinned fallback means the live source was unreachable and the universe may be slightly stale."
                  >
                    Universe: {data.universe_source}
                  </span>
                )}
              </div>

              {!hasCompanies && (
                <div className="max-w-xl mx-auto bg-[#0d1426] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400 mb-10">
                  No companies passed every filter in the most recent run. Check back next week.
                </div>
              )}

              {hasCompanies && (
                <div className="overflow-x-auto mb-10 bg-[#0d1426] border border-gray-800 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className={`${col.numeric ? "text-right" : "text-left"} px-4 py-3 ${
                              col.title ? "cursor-help" : ""
                            }`}
                            title={col.title}
                          >
                            {col.glossary ? (
                              <Link
                                href={`/glossary#${col.glossary}`}
                                className="hover:text-blue-300 underline decoration-dotted decoration-gray-700 underline-offset-4 transition"
                              >
                                {col.label}
                              </Link>
                            ) : (
                              col.label
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.companies.map((c) => (
                        <tr key={c.ticker} className="border-b border-gray-800/60 last:border-0">
                          {columns.map((col) => {
                            const value = c[col.key];
                            // Ticker and name carry their own treatment in both
                            // screens; everything else is driven by the descriptor.
                            if (col.key === "ticker") {
                              return (
                                <td key={col.key} className="px-4 py-3 font-mono text-blue-300">
                                  {c.ticker}
                                </td>
                              );
                            }
                            if (col.key === "nombre") {
                              return (
                                <td key={col.key} className="px-4 py-3 text-white">
                                  {c.nombre}
                                </td>
                              );
                            }
                            if (col.key === "sector") {
                              return (
                                <td key={col.key} className="px-4 py-3 text-gray-400">
                                  {c.sector}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                className={`px-4 py-3 ${col.numeric ? "text-right" : "text-left"} ${cellClassName(
                                  value,
                                  col
                                )}`}
                              >
                                {renderCell(value, col)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {hasCompanies && data.criteria && (
                <div className="bg-[#0d1426]/60 border border-gray-800 rounded-xl px-5 py-4 mb-10 text-xs text-gray-500 leading-relaxed">
                  <p className="mb-2">
                    <span className="text-gray-400 font-semibold">How to read this.</span>{" "}
                    {data.criteria.excluded_on_purpose}
                  </p>
                  {data.criteria.score && (
                    <p className="mb-2">
                      <span className="text-gray-400 font-semibold">Score.</span> {data.criteria.score}
                    </p>
                  )}
                  {data.criteria.free_cash_flow && (
                    <p className="mb-2">
                      <span className="text-gray-400 font-semibold">Free cash flow.</span>{" "}
                      {data.criteria.free_cash_flow}
                    </p>
                  )}
                  {data.criteria.trend && (
                    <p>
                      <span className="text-gray-400 font-semibold">Trend.</span> {data.criteria.trend}
                    </p>
                  )}
                </div>
              )}

              {data.report && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8">
                  <h3 className="text-white font-bold text-base mb-5">📊 Research report</h3>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {data.report}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <ScreenerPerformance screenerKey={performanceKey} />

              {hasValuations && (
                <div className="mt-10">
                  <div className="text-center mb-8">
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
                      What the price assumes
                    </p>
                    <h3 className="text-2xl font-extrabold text-white mb-2">Reverse DCF</h3>
                    <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                      Instead of asking whether these are good companies, this asks what today&apos;s
                      price already assumes — the free cash flow growth that makes a 10-year DCF equal
                      the current market cap — and compares it with the growth each business actually
                      delivered.
                    </p>
                  </div>

                  <div className="overflow-x-auto mb-6 bg-[#0d1426] border border-gray-800 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                          <th className="text-left px-4 py-3">Ticker</th>
                          <th className="text-right px-4 py-3">Price implies</th>
                          <th className="text-right px-4 py-3">Trend</th>
                          <th className="text-right px-4 py-3">Revenue</th>
                          <th className="text-right px-4 py-3">Gap</th>
                          <th className="text-right px-4 py-3">P(clears bar)</th>
                          <th className="text-right px-4 py-3">DCF value</th>
                          <th className="text-right px-4 py-3">vs price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.valuations!.map((v) => {
                          const confidence = probabilityConfidence(v.probability?.historical_log_stdev);
                          const trend = trendQuality(v.trend_r2);
                          const projectable = (v.trend_r2 ?? 0) >= 0.5;
                          // A negative gap means the price assumes less than the
                          // business has delivered — the favourable direction.
                          const gapFavourable = v.gap_pp !== null && v.gap_pp < 0;
                          const range = v.probability?.probability_range_pct;
                          // FCF and revenue moving together corroborates a trend;
                          // a wide split says the cash flow move came from
                          // somewhere other than the business growing.
                          const divergence = v.fcf_vs_revenue_divergence_pp;
                          const diverges = divergence !== null && divergence !== undefined && Math.abs(divergence) >= 10;
                          return (
                            <tr key={v.ticker} className="border-b border-gray-800/60 last:border-0">
                              <td className="px-4 py-3 font-mono text-blue-300">{v.ticker}</td>
                              <td
                                className={`px-4 py-3 text-right font-semibold ${
                                  v.implied_growth_pct !== null && v.implied_growth_pct < 0
                                    ? "text-amber-400"
                                    : "text-white"
                                }`}
                              >
                                {formatPct(v.implied_growth_pct)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={projectable ? "text-gray-300" : "text-gray-500"}>
                                  {formatPct(v.trend_growth_pct ?? v.historical_growth_pct)}
                                </span>
                                {trend && (
                                  <span className={`block text-[10px] ${trend.className}`}>
                                    {trend.label}
                                    {v.fcf_years ? ` · ${v.fcf_years}y` : ""}
                                  </span>
                                )}
                                {v.trend_broken && v.trend_recent_pct !== null && v.trend_recent_pct !== undefined && (
                                  <span
                                    className="block text-[10px] text-amber-400/70 cursor-help"
                                    title={`The long-run fit no longer matches the last few years (${formatPct(
                                      v.trend_recent_pct
                                    )}). The projection uses whichever of the two is lower.`}
                                  >
                                    now {formatPct(v.trend_recent_pct)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-gray-300">{formatPct(v.revenue_growth_pct)}</span>
                                {diverges && (
                                  <span
                                    className="block text-[10px] text-amber-400/70 cursor-help"
                                    title={`Free cash flow and revenue growth differ by ${divergence!.toFixed(
                                      1
                                    )} pp. The cash flow move is not corroborated by the top line — it may be working capital, a capex pause or something non-recurring rather than a trend.`}
                                  >
                                    {divergence! > 0 ? "+" : ""}
                                    {divergence!.toFixed(0)} pp split
                                  </span>
                                )}
                              </td>
                              <td
                                className={`px-4 py-3 text-right ${
                                  gapFavourable ? "text-emerald-400" : "text-gray-400"
                                }`}
                              >
                                {v.gap_pp === null ? (
                                  <span className="text-gray-600" title="No reliable trend to measure against.">
                                    —
                                  </span>
                                ) : (
                                  `${v.gap_pp > 0 ? "+" : ""}${v.gap_pp.toFixed(1)} pp`
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {v.probability?.probability_pct === null ||
                                v.probability?.probability_pct === undefined ? (
                                  <span
                                    className="text-gray-600 cursor-help"
                                    title={v.probability?.reason ?? "No usable estimate."}
                                  >
                                    withheld
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-gray-300">
                                      {range && range.length === 2
                                        ? `${range[0].toFixed(0)}–${range[1].toFixed(0)}%`
                                        : `${v.probability.probability_pct.toFixed(0)}%`}
                                    </span>
                                    {confidence && (
                                      <span className={`block text-[10px] ${confidence.className}`}>
                                        {confidence.label}
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-300">
                                {v.dcf_value_per_share === null ? (
                                  <span
                                    className="text-gray-600 cursor-help"
                                    title={v.dcf_skipped_reason ?? "No projection made."}
                                  >
                                    not projected
                                  </span>
                                ) : (
                                  <>
                                    {formatMoney(v.dcf_value_per_share, v.currency)}
                                    {v.dcf_terminal_value_share_pct !== null &&
                                      v.dcf_terminal_value_share_pct !== undefined && (
                                        <span
                                          className="block text-[10px] text-gray-500 cursor-help"
                                          title={`${v.dcf_terminal_value_share_pct.toFixed(
                                            0
                                          )}% of this value comes from the 2.5% perpetuity rather than the ten explicit years.`}
                                        >
                                          {v.dcf_terminal_value_share_pct.toFixed(0)}% terminal
                                        </span>
                                      )}
                                  </>
                                )}
                              </td>
                              <td
                                className={`px-4 py-3 text-right ${
                                  v.dcf_upside_pct === null
                                    ? "text-gray-400"
                                    : v.dcf_upside_pct > 0
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                }`}
                              >
                                {formatPct(v.dcf_upside_pct, true)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#0d1426]/60 border border-gray-800 rounded-xl px-5 py-4 mb-6 text-xs text-gray-500 leading-relaxed">
                    <p className="mb-2">
                      <span className="text-gray-400 font-semibold">How to read this.</span>{" "}
                      <span className="text-gray-400">Price implies</span> is a reverse DCF — the growth
                      rate that justifies today&apos;s price, not a forecast. A negative figure means the
                      price assumes the business shrinks. It is the only column available for every
                      company, because it needs no history at all.
                    </p>
                    <p className="mb-2">
                      <span className="text-gray-400">Trend</span> is a least-squares fit through log free
                      cash flow, and its R² says whether the cash flows behave like a trend in the first
                      place. Below 0.5 they don&apos;t, so nothing is projected and the DCF reads{" "}
                      <span className="text-gray-400">not projected</span> — that is a result, not missing
                      data. <span className="text-gray-400">Revenue</span> is the corroboration check: when
                      cash flow and the top line move together the trend is probably real, and a wide split
                      suggests the cash moved for some other reason.
                    </p>
                    <p className="mb-2">
                      <span className="text-gray-400">P(clears bar)</span> is how often this company&apos;s
                      own cash flow history cleared that growth rate. How much history sits behind it varies
                      by company — {observationRange} — because the long record comes from SEC filings and
                      only exists for US filers; everything else falls back to a four-year window. It is
                      shown as a range rather than a single figure, and withheld altogether where the cash
                      flows swing too violently for any estimate to mean anything. It says nothing about
                      what the future will do.
                    </p>
                    {data.valuation_method && (
                      <p className="mb-2">
                        {data.valuation_method.horizon_years}-year two-stage DCF on levered free cash
                        flow, {data.valuation_method.terminal_growth_pct}% terminal growth.{" "}
                        {data.valuation_method.discount_rate}
                      </p>
                    )}
                    {data.valuation_method?.known_limits && (
                      <div>
                        <span className="text-gray-400 font-semibold">Where this model is weakest.</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {data.valuation_method.known_limits.map((limit, i) => (
                            <li key={i}>{limit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {data.valuation_report && (
                    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8">
                      <h3 className="text-white font-bold text-base mb-5">🧮 Valuation commentary</h3>
                      <div className="text-sm text-gray-300 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {data.valuation_report}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <RelatedTools current={relatedSlug} />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
