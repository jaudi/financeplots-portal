"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RelatedTools from "@/components/RelatedTools";

interface Company {
  ticker: string;
  nombre: string;
  sector: string;
  per: number;
  roe: string;
  roa: string;
  deuda_patrimonio: string;
  rsi: number;
  precio_actual: number;
  ma50: number;
}

interface ScreenerReportData {
  generated_at: string | null;
  universe_size: number;
  analyzed: number;
  passed_filters: number;
  companies: Company[];
  failed: { ticker: string; error: string }[];
  report: string | null;
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
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ScreenerReport({
  apiPath,
  emoji,
  universeName,
  relatedSlug,
  jsonLdName,
  jsonLdDescription,
  jsonLdUrl,
}: ScreenerReportProps) {
  const tc = useTranslations("toolCommon");
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
          <h1 className="text-white font-bold hidden sm:block">{emoji} {universeName} Quality Screener</h1>
          <span className="ml-auto text-xs text-gray-600 hidden md:block">{tc("disclaimer")}</span>
        </div>
      </div>

      <div className="pt-[109px] pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Quality Screener</p>
            <h2 className="text-3xl font-extrabold text-white mb-2">{universeName} Quality Screener</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Every week, the full {universeName} is screened on quality fundamentals (ROE &gt; 20%, ROA &gt; 12%, P/E &lt; 20,
              Debt/Equity &lt; 100%) and momentum (RSI &gt; 30, price above the 50-day moving average). An AI agent
              then researches the names that pass and writes an executive summary.
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
                <span>{data.analyzed} companies analyzed</span>
                <span>{data.passed_filters} passed all filters</span>
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
                        <th className="text-left px-4 py-3">Ticker</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Sector</th>
                        <th className="text-right px-4 py-3">P/E</th>
                        <th className="text-right px-4 py-3">ROE</th>
                        <th className="text-right px-4 py-3">ROA</th>
                        <th className="text-right px-4 py-3">D/E</th>
                        <th className="text-right px-4 py-3">RSI</th>
                        <th className="text-right px-4 py-3">Price</th>
                        <th className="text-right px-4 py-3">MA50</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.companies.map((c) => (
                        <tr key={c.ticker} className="border-b border-gray-800/60 last:border-0">
                          <td className="px-4 py-3 font-mono text-blue-300">{c.ticker}</td>
                          <td className="px-4 py-3 text-white">{c.nombre}</td>
                          <td className="px-4 py-3 text-gray-400">{c.sector}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.per}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.roe}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.roa}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.deuda_patrimonio}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.rsi}</td>
                          <td className="px-4 py-3 text-right text-gray-300">${c.precio_actual}</td>
                          <td className="px-4 py-3 text-right text-gray-300">${c.ma50}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data.report && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 sm:p-8">
                  <h3 className="text-white font-bold text-base mb-5">📊 Research report</h3>
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
                        table: (p) => (
                          <div className="overflow-x-auto mb-4 border border-gray-800 rounded-lg">
                            <table className="w-full text-xs" {...p} />
                          </div>
                        ),
                        thead: (p) => <thead className="bg-black/20" {...p} />,
                        th: (p) => <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-800" {...p} />,
                        td: (p) => <td className="px-3 py-2 border-b border-gray-800/60 text-gray-300 align-top" {...p} />,
                      }}
                    >
                      {data.report}
                    </ReactMarkdown>
                  </div>
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
