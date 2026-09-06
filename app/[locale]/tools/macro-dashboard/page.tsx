"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";

interface Indicator {
  id: string;
  label: string;
  group: string;
  value: number;
  change: number | null;
  date: string;
}

interface MacroResponse {
  indicators: Indicator[];
  ts: number;
  error?: string;
}

interface ReportResponse {
  report: string;
  model: string;
  generatedAt: string;
  asOf: string | null;
  error?: string;
}

const GROUP_ORDER = ["Growth", "Inflation", "Labor", "Rates"] as const;

const GROUP_META: Record<string, { icon: string; blurb: string }> = {
  Growth:    { icon: "📈", blurb: "Real output of the US economy." },
  Inflation: { icon: "🔥", blurb: "Pace of price increases across consumer and core baskets." },
  Labor:     { icon: "👷", blurb: "Health of the US job market." },
  Rates:     { icon: "🏦", blurb: "Policy rate and the market's long-term cost of money." },
};

const INDICATOR_DESC: Record<string, string> = {
  GDPC1:    "Real Gross Domestic Product, year-over-year change. The headline measure of US economic growth.",
  INDPRO:   "Industrial Production index, year-over-year. Factory, mining and utility output.",
  CPIAUCSL: "Consumer Price Index, year-over-year. Headline inflation including food and energy.",
  CPILFESL: "Core CPI, year-over-year. Excludes volatile food and energy prices.",
  PCEPI:    "Personal Consumption Expenditures price index. The Fed's preferred inflation gauge.",
  UNRATE:   "Unemployment rate. Share of the labor force actively looking for work.",
  FEDFUNDS: "Federal Funds effective rate. The Fed's main policy lever.",
  DGS10:    "10-Year Treasury constant maturity yield. The global risk-free rate benchmark.",
};

function formatValue(v: number) {
  return `${v.toFixed(2)}%`;
}

function formatChange(c: number | null) {
  if (c == null) return null;
  const sign = c > 0 ? "+" : "";
  return `${sign}${c.toFixed(2)}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function MacroDashboardPage() {
  const tc = useTranslations("toolCommon");
  const [data, setData] = useState<MacroResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/macro");
        const json: MacroResponse = await res.json();
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/macro/report");
        const json: ReportResponse = await res.json();
        if (cancelled) return;
        if (res.ok && json.report) setReport(json);
      } catch {
        // The commentary is supplementary — the dashboard stands without it.
      } finally {
        if (!cancelled) setReportLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const byGroup: Record<string, Indicator[]> = {};
  for (const ind of data?.indicators ?? []) {
    (byGroup[ind.group] ??= []).push(ind);
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "US Macro Dashboard",
          "description": "Live dashboard of key US macroeconomic indicators — GDP, inflation, unemployment, Fed Funds and Treasury yields — sourced from FRED.",
          "url": "https://www.financeplots.com/tools/macro-dashboard",
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
          <h1 className="text-white font-bold hidden sm:block">📊 US Macro Dashboard</h1>
          <span className="ml-auto text-xs text-gray-600 hidden md:block">{tc("disclaimer")}</span>
        </div>
      </div>

      <div className="pt-[109px] pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Macro</p>
            <h2 className="text-3xl font-extrabold text-white mb-2">US Macro Dashboard</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Key US macroeconomic indicators at a glance — growth, inflation, labor and rates. Data from the Federal Reserve Bank of St. Louis (FRED).
            </p>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-16 text-sm">Loading latest indicators…</div>
          )}

          {error && !loading && (
            <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-sm text-red-300">
              <div className="font-bold mb-1">Couldn&apos;t load macro data</div>
              <div className="text-red-300/80">{error}</div>
            </div>
          )}

          {data && !loading && !error && (
            <>
              <div className="space-y-10">
                {GROUP_ORDER.map((group) => {
                  const items = byGroup[group];
                  if (!items || items.length === 0) return null;
                  const meta = GROUP_META[group];
                  return (
                    <section key={group}>
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{meta.icon}</span>{group}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{meta.blurb}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((ind) => {
                          const changeStr = formatChange(ind.change);
                          const up = ind.change != null && ind.change > 0;
                          const down = ind.change != null && ind.change < 0;
                          return (
                            <div
                              key={ind.id}
                              className="bg-[#0d1426] border border-gray-800 rounded-xl p-5"
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                  <div className="text-white font-bold text-sm">{ind.label}</div>
                                  <div className="text-xs text-gray-600 font-mono mt-0.5">{ind.id}</div>
                                </div>
                                {changeStr && (
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      up ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : down ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                      : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                    }`}
                                  >
                                    {up ? "▲" : down ? "▼" : "●"} {changeStr}
                                  </span>
                                )}
                              </div>
                              <div className="text-3xl font-extrabold text-white mb-2">
                                {formatValue(ind.value)}
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                {INDICATOR_DESC[ind.id]}
                              </p>
                              <div className="text-[11px] text-gray-600 pt-2 border-t border-gray-800/60">
                                As of {formatDate(ind.date)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              {(reportLoading || report) && (
                <section className="mt-12 bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-white">What the data says</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded px-1.5 py-0.5">
                      AI summary
                    </span>
                  </div>

                  {reportLoading && !report && (
                    <div className="text-sm text-gray-500">Writing the latest commentary…</div>
                  )}

                  {report && (
                    <>
                      <div className="space-y-4">
                        {report.report.split(/\n\s*\n/).map((para, i) => (
                          <p key={i} className="text-sm text-gray-300 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-6 pt-4 border-t border-gray-800/60">
                        Written by {report.model} from the FRED values above on {formatDate(report.generatedAt)}. Commentary only — not investment advice.
                      </p>
                    </>
                  )}
                </section>
              )}

              <p className="text-xs text-gray-600 text-center mt-10">
                Source: <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">FRED</a> · Federal Reserve Bank of St. Louis. Data refreshes daily.
              </p>
            </>
          )}

        </div>
      </div>

      <RelatedTools current="stock-comparison" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
