import Link from "next/link";
import type { FundsReportData, ScreenerReportData } from "@/lib/screener";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type Props = {
  report: ScreenerReportData | null;
  ibex35Report: ScreenerReportData | null;
  fundsReport: FundsReportData | null;
};

export default function ScreenerSpotlight({ report, ibex35Report, fundsReport }: Props) {
  const companies = report?.companies ?? [];
  const preview = companies.slice(0, 5);
  const extraCount = Math.max(0, companies.length - preview.length);
  const generatedLabel = formatDate(report?.generated_at ?? null);

  const ibexCompanies = ibex35Report?.companies ?? [];
  const ibexPreview = ibexCompanies.slice(0, 3);
  const funds = fundsReport?.funds ?? [];
  const topFunds = funds.slice(0, 3);

  return (
    <section className="relative px-6 pt-32 pb-16 overflow-hidden">
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5">
            🏆 New — AI Quality Screener
          </span>
          {generatedLabel && <span className="text-gray-500 text-xs">Last run: {generatedLabel}</span>}
        </div>

        <Link href="/tools/quality-screener" className="block group">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-4 tracking-tight group-hover:text-blue-300 transition">
            S&amp;P 500 Quality Screener
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl">
            Every week, an AI agent screens the full S&amp;P 500 on quality fundamentals (ROE, ROA, P/E, Debt/Equity)
            and momentum, then researches every name that passes and writes an executive report.
          </p>
        </Link>

        {preview.length > 0 ? (
          <div className="flex flex-wrap gap-3 mb-8">
            {preview.map((c) => (
              <Link
                key={c.ticker}
                href="/tools/quality-screener"
                className="flex items-center gap-2 bg-[#0d1426] border border-gray-700 hover:border-yellow-500/60 rounded-xl px-4 py-2.5 text-sm transition"
              >
                <span className="font-mono font-bold text-yellow-400">{c.ticker}</span>
                <span className="text-gray-400">{c.roe} ROE</span>
              </Link>
            ))}
            {extraCount > 0 && (
              <span className="flex items-center text-gray-500 text-sm px-2">+{extraCount} more</span>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-8">
            No companies passed every filter in the most recent run — check back next week.
          </p>
        )}

        <div className="flex gap-4 flex-wrap">
          <Link
            href="/tools/quality-screener"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-blue-600/25"
          >
            See the full report →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-12 pt-10 border-t border-gray-800">
          <Link
            href="/tools/quality-screener-ibex35"
            className="block bg-[#0d1426] border border-gray-800 hover:border-yellow-500/60 rounded-2xl p-6 transition group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇪🇸</span>
              <h2 className="text-white font-bold text-lg group-hover:text-blue-300 transition">IBEX 35 Quality Screener</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              The same weekly agent, tuned for Spain — ROA is reported but not a hard filter, since low ROA is
              structural for the index&apos;s banks and utilities.
            </p>
            {ibexPreview.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ibexPreview.map((c) => (
                  <span key={c.ticker} className="font-mono text-xs font-bold text-yellow-400 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-2.5 py-1">
                    {c.ticker}
                  </span>
                ))}
                {ibexCompanies.length > ibexPreview.length && (
                  <span className="text-gray-500 text-xs px-1 py-1">+{ibexCompanies.length - ibexPreview.length} more</span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-xs">No names passed every filter in the latest run.</span>
            )}
          </Link>

          <Link
            href="/tools/etf-screener"
            className="block bg-[#0d1426] border border-gray-800 hover:border-yellow-500/60 rounded-2xl p-6 transition group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📊</span>
              <h2 className="text-white font-bold text-lg group-hover:text-blue-300 transition">ETF Screener</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              UCITS equity ETFs from the iShares catalogue with a TER under 0.20%, ranked by 3-year Sharpe ratio.
            </p>
            {topFunds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topFunds.map((f) => (
                  <span key={f.isin} className="font-mono text-xs font-bold text-yellow-400 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-2.5 py-1">
                    {f.ticker}
                  </span>
                ))}
                {funds.length > topFunds.length && (
                  <span className="text-gray-500 text-xs px-1 py-1">+{funds.length - topFunds.length} more</span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-xs">Ranking refreshes with the next weekly run.</span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
