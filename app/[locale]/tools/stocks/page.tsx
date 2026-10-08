import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import StocksHub from "@/components/StocksHub";
import StocksNav from "@/components/StocksNav";
import RelatedTools from "@/components/RelatedTools";

export const metadata: Metadata = {
  title: "Stocks — Price History, Comparison, Portfolio Analysis and a Neutral Screener",
  description:
    "One place for stocks: search any company, chart its price, compare up to four, analyse a portfolio's risk and return, or filter the S&P 500, Nasdaq-100, IBEX 35 and FTSE 100 by measures you choose. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/stocks" },
};

export default async function StocksPage() {
  // English on every locale, like the stock tools it gathers.
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <div className="pt-[100px] pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StocksNav current="hub" />
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Stocks, in one place</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Look up a company, compare a few, see how a portfolio of them behaved, or filter an index by the
              measures you care about. The tickers you pick come with you from one view to the next.
            </p>
          </div>

          <StocksHub />

          <div className="max-w-2xl mx-auto mt-12 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>
        </div>
      </div>
      <RelatedTools current="stocks" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
