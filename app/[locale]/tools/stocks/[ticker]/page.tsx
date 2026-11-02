import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import StockAnalysis from "@/components/StockAnalysis";
import CompanyHistory from "@/components/CompanyHistory";
import CompanySnowflake, { type SnowflakeLayer } from "@/components/CompanySnowflake";
import { AddToListButton } from "@/components/MyList";
import StocksNav from "@/components/StocksNav";
import PositionBar from "@/components/PositionBar";
import { getCompanyProfile, getCompanyProfiles, INDEX_LABELS, plainSentence, type CompanyProfile } from "@/lib/company";
import { headquartersOf } from "@/lib/company-map";
import { tryFinancialHistory } from "@/lib/edgar";
import { normaliseSymbol } from "@/lib/price-types";
import { formatMetric, MAX_VS } from "@/lib/stock-metrics";

// A page per company, Simply Wall St-style but neutral (UK MAR, CLAUDE.md):
// the reported figures, a plain-English line for each, and where each sits in
// its index — one bar per measure, one colour, no group or total score, no
// verdicts. "Further right" means a higher figure, never a better one.
// Ratios come from the weekly screener snapshot; price only from the live chart.
//
// US companies also get ten years from their annual reports (SEC EDGAR). Only
// pages with that history are indexed: without it a page is one snapshot of
// figures in a template, which reads as thin content.

type Props = { params: Promise<{ ticker: string }>; searchParams: Promise<{ vs?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = normaliseSymbol(decodeURIComponent((await params).ticker)) ?? "";
  const [profile, history] = ticker ? await Promise.all([getCompanyProfile(ticker), tryFinancialHistory(ticker)]) : [null, null];
  const name = profile?.company.nombre ?? ticker;
  // If the SEC didn't answer just now, don't tell crawlers to drop a US page
  // that normally has its history.
  const indexable =
    profile !== null &&
    (history === "unavailable" ? !ticker.includes(".") : history !== null && history.years.length >= 3);
  return {
    title: `${name} (${ticker}) — Price History and Key Figures`,
    description: `${name}: share price history, valuation, profitability, debt and growth figures, each shown against the rest of its index. Figures only — not a recommendation.`,
    robots: { index: indexable, follow: true },
    ...(indexable && { alternates: { canonical: `https://www.financeplots.com/tools/stocks/${encodeURIComponent(ticker)}` } }),
  };
}

/** One snowflake layer per company with figures, in the order typed. */
function snowflakeLayers(columns: { ticker: string; profile: CompanyProfile | null }[]): SnowflakeLayer[] {
  return columns.flatMap(({ ticker, profile }) => {
    if (!profile) return [];
    const indexLabel = INDEX_LABELS[profile.index];
    const measures = profile.groups.flatMap((g) => g.measures);
    return [{
      ticker,
      indexLabel,
      positions: measures.map((m) => m.position),
      values: measures.map((m) => formatMetric(m.value, m.metric)),
      titles: measures.map((m) =>
        m.position === null
          ? "No figure reported."
          : `${formatMetric(m.value, m.metric)} — higher than ${Math.round(m.position)}% of the ${indexLabel}`,
      ),
    }];
  });
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const raw = decodeURIComponent((await params).ticker);
  const ticker = normaliseSymbol(raw);
  // ?vs=MSFT: a second company drawn on the same snowflake. Typed by the
  // visitor, never suggested by the site.
  const vs = [...new Set(((await searchParams).vs ?? "").split(",").map((t) => normaliseSymbol(t.trim())).filter((t): t is string => !!t && t !== ticker))].slice(0, MAX_VS);
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });
  const [[profile, ...vsProfiles], history] = ticker
    ? await Promise.all([getCompanyProfiles([ticker, ...vs]), tryFinancialHistory(ticker)])
    : [[null], null];
  const indexLabel = profile ? INDEX_LABELS[profile.index] : "";
  const hq = profile ? headquartersOf(profile.company.ticker) : null;
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
                {hq && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    📍 {hq.city}, {hq.country} ·{" "}
                    <Link href={`/tools/company-map?focus=${encodeURIComponent(ticker)}`} className="text-blue-400 hover:underline">
                      See it on the company map
                    </Link>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link href={`/tools/portfolio-analysis?h=${encodeURIComponent(ticker)}:1`} className="bg-[#111827] border border-gray-700 hover:border-blue-500 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    📊 Analyse in a portfolio
                  </Link>
                  <AddToListButton ticker={ticker} />
                </div>
              </header>

              {profile && (
                <section className="mb-8">
                  <CompanySnowflake
                    spokes={profile.groups.flatMap((g) => g.measures.map((m) => ({ label: m.metric.short, group: g.group })))}
                    layers={snowflakeLayers([{ ticker, profile }, ...vs.map((t, i) => ({ ticker: t, profile: vsProfiles[i] ?? null }))])}
                    ticker={ticker}
                    vs={vs[0] ?? null}
                    vsMissing={vs.length > 0 && !vsProfiles[0]}
                  />
                </section>
              )}

              <StockAnalysis initialSymbol={ticker} initialRange="1y" fixed />

              {history === "unavailable" ? (
                <p className="mt-10 text-sm text-gray-500">Figures from the annual reports are unavailable right now — please try again in a minute.</p>
              ) : (
                history && <CompanyHistory history={history} />
              )}

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
                              {m.value !== null && <p className="text-xs text-gray-400 mt-0.5 mb-2">{plainSentence(m.metric.key, m.value)}</p>}
                              <PositionBar position={m.position} indexLabel={indexLabel} />
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
                  Nasdaq-100, FTSE 100 and IBEX 35.
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
