import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import StockAnalysis from "@/components/StockAnalysis";
import StocksNav from "@/components/StocksNav";
import { getCompanyProfile, INDEX_LABELS, type CompanyMeasure } from "@/lib/company";
import { normaliseSymbol } from "@/lib/price-types";
import { formatMetric, type MetricKey } from "@/lib/stock-metrics";

// A page per company, Simply Wall St-style but neutral (UK MAR, CLAUDE.md):
// the reported figures, a plain-English line for each, and where each sits in
// its index — one bar per measure, one colour, no group or total score, no
// verdicts. "Further right" means a higher figure, never a better one.
// Ratios come from the weekly screener snapshot; price only from the live chart.
//
// noindex until the page carries more than one snapshot of figures (phase 3,
// SEC EDGAR history): ~600 near-identical template pages would read as thin.

type Props = { params: Promise<{ ticker: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = normaliseSymbol(decodeURIComponent((await params).ticker)) ?? "";
  const profile = ticker ? await getCompanyProfile(ticker) : null;
  const name = profile?.company.nombre ?? ticker;
  return {
    title: `${name} (${ticker}) — Price History and Key Figures`,
    description: `${name}: share price history, valuation, profitability, debt, growth and price-trend figures, each shown against the rest of its index. Figures only — not a recommendation.`,
    robots: { index: false, follow: true },
  };
}

const n = (v: number, dp = 1) => Math.abs(v).toLocaleString("en-GB", { maximumFractionDigits: dp });

/** What the figure means, in a sentence. Descriptive only: never "cheap",
 *  "strong", "overbought" or any other judgement. */
function plain(key: MetricKey, v: number): string {
  switch (key) {
    case "per": return `The share price is ${n(v)} times the last twelve months' earnings per share.`;
    case "per_normalizado": return `The share price is ${n(v)} times earnings per share averaged over recent years.`;
    case "precio_valor_libros": return `The market values the company at ${n(v)} times the accounting value of its equity.`;
    case "ev_ebit": return `The company's value including its debt is ${n(v)} times its operating profit.`;
    case "fcf_yield": return v >= 0 ? `Free cash flow equals ${n(v)}% of the company's market value.` : `Free cash flow was negative, equal to −${n(v)}% of market value.`;
    case "roe": return `Each 100 of shareholders' money produced ${v < 0 ? "a loss of " : ""}${n(v)} of net profit.`;
    case "roa": return `Each 100 of assets produced ${v < 0 ? "a loss of " : ""}${n(v)} of net profit.`;
    case "roic": return `Each 100 invested by lenders and owners produced ${v < 0 ? "a loss of " : ""}${n(v)} of profit.`;
    case "margen_operativo": return v >= 0 ? `Of every 100 in sales, ${n(v)} was left as operating profit.` : `Operating costs exceeded sales by ${n(v)} per 100 of sales.`;
    case "deuda_patrimonio": return `Total debt equals ${n(v, 0)}% of shareholders' equity.`;
    case "deuda_neta_ebitda": return v < 0 ? "The company holds more cash than debt." : `Net debt equals ${n(v)} years of operating earnings (EBITDA).`;
    case "cobertura_intereses": return `Operating profit was ${n(v)} times the interest bill.`;
    case "crecimiento_ingresos_normalizado": return `Latest revenue is ${n(v)}% ${v >= 0 ? "above" : "below"} the average of earlier reported years.`;
    case "crecimiento_beneficios_normalizado": return `Latest net profit is ${n(v)}% ${v >= 0 ? "above" : "below"} the average of earlier reported years.`;
    default: return "";
  }
}

function PositionBar({ m, indexLabel }: { m: CompanyMeasure; indexLabel: string }) {
  if (m.position === null) return <p className="text-xs text-gray-600">No figure for this company.</p>;
  const p = Math.round(m.position);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-gray-800" role="img" aria-label={`Higher than ${p}% of the ${indexLabel}`}>
        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-700" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 ring-2 ring-[#0d1426]" style={{ left: `${p}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        <span>lowest</span>
        <span className="text-gray-400">higher than {p}% of the {indexLabel}</span>
        <span>highest</span>
      </div>
    </div>
  );
}

export default async function CompanyPage({ params }: Props) {
  const raw = decodeURIComponent((await params).ticker);
  const ticker = normaliseSymbol(raw);
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });
  const profile = ticker ? await getCompanyProfile(ticker) : null;
  const indexLabel = profile ? INDEX_LABELS[profile.index] : "";
  const asOf = profile?.generatedAt
    ? new Date(profile.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <div className="pt-[100px] pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StocksNav current="hub" />

          {!ticker ? (
            <p className="text-gray-400">That doesn&apos;t look like a ticker. <Link href="/tools/stocks" className="text-blue-400">Search again →</Link></p>
          ) : (
            <>
              <header className="mb-6">
                <p className="font-mono text-blue-400 text-sm font-bold">{ticker}</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{profile?.company.nombre ?? ticker}</h1>
                {profile && (
                  <p className="text-gray-400 text-sm mt-1">
                    {profile.company.sector} · in the {profile.memberOf.map((s) => INDEX_LABELS[s]).join(" and the ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link href={`/tools/stock-comparison?symbols=${encodeURIComponent(ticker)}`} className="bg-[#111827] border border-gray-700 hover:border-blue-500 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    📉 Compare with others
                  </Link>
                  <Link href={`/tools/portfolio-analysis?h=${encodeURIComponent(ticker)}:1`} className="bg-[#111827] border border-gray-700 hover:border-blue-500 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    📊 Analyse in a portfolio
                  </Link>
                </div>
              </header>

              <StockAnalysis initialSymbol={ticker} initialRange="1y" fixed />

              {profile ? (
                <section className="mt-10">
                  <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
                    <h2 className="text-xl font-bold text-white">Key figures, against the {indexLabel}</h2>
                    {asOf && <p className="text-xs text-gray-500">Figures as of {asOf}, refreshed weekly</p>}
                  </div>
                  <p className="text-sm text-gray-400 mb-6 max-w-3xl leading-relaxed">
                    Each bar places this company among the {indexLabel} companies that report that figure.
                    Further right means a <em>higher</em> figure — not a better one. Whether higher or lower suits you
                    depends on what you are looking for, so the bars don&apos;t add up to a score.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.groups.map(({ group, measures }) => (
                      <div key={group} className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">{group}</h3>
                        <div className="flex flex-col gap-5">
                          {measures.map((m) => (
                            <div key={m.metric.key}>
                              <div className="flex justify-between gap-3">
                                <p className="text-sm text-white font-semibold">
                                  {m.metric.label}
                                  {m.metric.glossary && (
                                    <Link href={`/glossary#${m.metric.glossary}`} className="ml-1.5 text-[10px] text-blue-400 hover:underline font-normal">?</Link>
                                  )}
                                </p>
                                <p className="font-mono text-sm text-gray-200 shrink-0">{formatMetric(m.value, m.metric)}</p>
                              </div>
                              {m.value !== null && <p className="text-xs text-gray-400 mt-0.5 mb-2">{plain(m.metric.key, m.value)}</p>}
                              <PositionBar m={m} indexLabel={indexLabel} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <p className="mt-8 text-sm text-gray-400 bg-[#0d1426] border border-gray-800 rounded-xl px-5 py-4">
                  We have the price history for {ticker}, but key figures only for companies in the S&amp;P 500,
                  Nasdaq-100 and IBEX 35.
                </p>
              )}

              <div className="mt-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
                <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
