"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RelatedTools from "@/components/RelatedTools";
import type { FundsReportData } from "@/lib/screener";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function FundsScreenerReport() {
  const tc = useTranslations("toolCommon");
  const [data, setData] = useState<FundsReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/screener-funds");
        const json: FundsReportData = await res.json();
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

  const generatedLabel = formatDate(data?.generated_at ?? null);
  const hasFunds = (data?.funds?.length ?? 0) > 0;
  const m = data?.methodology;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ETF Screener — Transparent Funds by Sharpe Ratio",
          "description": "Ranks low-cost, London-listed iShares ETFs by 3-year Sharpe ratio, filtered by domicile and expense ratio, with an AI-generated commentary.",
          "url": "https://www.financeplots.com/tools/etf-screener",
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
          <h1 className="text-white font-bold hidden sm:block">📈 ETF Screener — Best Sharpe Ratio</h1>
          <span className="ml-auto text-xs text-gray-600 hidden md:block">{tc("disclaimer")}</span>
        </div>
      </div>

      <div className="pt-[109px] pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">ETF Screener</p>
            <h2 className="text-3xl font-extrabold text-white mb-2">Transparent Funds, Ranked by Sharpe Ratio</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Low-cost, London-listed ETFs ranked by risk-adjusted return over the last 3 years — filtered for
              transparency (real ETFs only, low fees, recognised UCITS domiciles) before anything gets ranked.
            </p>
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
                <span>{data.universe_size} ETFs evaluated</span>
                <span>{data.passed_filters} passed every filter</span>
              </div>

              {!hasFunds && (
                <div className="max-w-xl mx-auto bg-[#0d1426] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400 mb-10">
                  No funds passed every filter in the most recent run. Check back after the next scheduled run.
                </div>
              )}

              {hasFunds && (
                <div className="overflow-x-auto mb-10 bg-[#0d1426] border border-gray-800 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Ticker</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Domicile</th>
                        <th className="text-right px-4 py-3">TER</th>
                        <th className="text-right px-4 py-3">3y Return</th>
                        <th className="text-right px-4 py-3">3y Vol</th>
                        <th className="text-right px-4 py-3">Sharpe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.funds.map((f) => (
                        <tr key={f.isin} className="border-b border-gray-800/60 last:border-0">
                          <td className="px-4 py-3 font-mono text-blue-300">
                            {f.ticker}
                            {!f.listado_lse && (
                              <span className="ml-1.5 text-[10px] text-amber-400/80 font-sans" title="No London (LSE) listing found for this fund — shown on its next-best exchange">
                                ⚠ non-LSE
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white">{f.nombre}</td>
                          <td className="px-4 py-3 text-gray-400">{f.domicilio}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{f.ter.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-right text-gray-300">{f.rendimiento_3y.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right text-gray-300">{f.volatilidad_3y.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right text-white font-semibold">{f.sharpe.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data.report && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8 mb-10">
                  <h3 className="text-white font-bold text-base mb-5">📊 AI commentary</h3>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: (p) => <h1 className="text-xl font-extrabold text-white mt-6 mb-3 first:mt-0" {...p} />,
                        h2: (p) => <h2 className="text-lg font-bold text-white mt-6 mb-3 first:mt-0" {...p} />,
                        h3: (p) => <h3 className="text-base font-bold text-blue-300 mt-5 mb-2" {...p} />,
                        p: (p) => <p className="mb-4 text-gray-300" {...p} />,
                        strong: (p) => <strong className="text-white font-semibold" {...p} />,
                        ul: (p) => <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-300" {...p} />,
                        ol: (p) => <ol className="list-decimal list-inside mb-4 space-y-1.5 text-gray-300" {...p} />,
                        li: (p) => <li className="pl-1" {...p} />,
                        hr: () => <hr className="border-gray-800 my-6" />,
                        a: (p) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...p} />,
                        code: (p) => <code className="bg-black/30 text-blue-300 px-1.5 py-0.5 rounded text-xs" {...p} />,
                      }}
                    >
                      {data.report}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Methodology — documented in full, not just summarised */}
              {m && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8">
                  <h3 className="text-white font-bold text-base mb-5">🔍 Methodology</h3>
                  <div className="text-sm text-gray-300 leading-relaxed space-y-4">

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Data source</p>
                      <p>{m.data_source}. This is the same feed iShares uses to power their own retail
                      fund-finder tool — it is not a third-party aggregator or a scrape of a paid service.</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Universe filters</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong className="text-white">Vehicle:</strong> {m.vehicle}.</li>
                        <li><strong className="text-white">Domicile:</strong> {m.domicile.join(", ")}. {m.domicile_note}.</li>
                        <li><strong className="text-white">Expense ratio (TER/OCF):</strong> below {m.max_ter_ocf_pct}%, read directly from iShares&apos; own published figure — a fund with no TER on file is dropped, never estimated.</li>
                        <li><strong className="text-white">Asset class:</strong> {m.asset_class} only, so every fund in the ranking carries a broadly comparable risk profile — comparing a government-bond ETF&apos;s Sharpe ratio against an equity ETF&apos;s would not be a fair ranking.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Listing</p>
                      <p>{m.listing_preference}. A fund with no London listing found by name search is still
                      included, shown on its next-best exchange and flagged with a <span className="text-amber-400/80">⚠ non-LSE</span> tag
                      in the table above — it may still be tradable via a different route on some platforms, but wasn&apos;t
                      confirmed as directly buyable on a typical UK broker.</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Sharpe ratio calculation</p>
                      <p>{m.sharpe_calc}. The 0% risk-free rate is a simplification, stated plainly rather
                      than hidden — it is not the actual short-term interest rate, so the ranking measures
                      return-per-unit-of-volatility, not a textbook-precise Sharpe ratio.</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Data quality checks</p>
                      <p>{m.sanity_filter}. Two funds resolving to the same exchange ticker (which can happen
                      when two similarly-named share classes are resolved by a text search) are deduplicated,
                      keeping only the first.</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Known limitation</p>
                      <p>This screener currently covers <strong className="text-white">iShares (BlackRock) funds only</strong> —
                      the one major provider with a public product-data API this pipeline could reliably use.
                      It is not a cross-provider comparison against Vanguard, Xtrackers, SPDR, Amundi or others,
                      and a 3-year Sharpe ratio reflects a single historical window, not a guarantee of future
                      risk-adjusted return.</p>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <RelatedTools current="etf-screener" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
