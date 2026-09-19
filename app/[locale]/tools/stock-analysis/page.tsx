import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import StockAnalysis from "@/components/StockAnalysis";
import RelatedTools from "@/components/RelatedTools";
import { normaliseSymbol, PRICE_RANGES, type PriceRange } from "@/lib/price-types";

export const metadata: Metadata = {
  title: "Stock Price History — Chart Any Ticker With Its 200-Day Average",
  description:
    "Chart the closing-price history of any stock, index or currency: 1 month to all available history, with the 200-day moving average, highs and lows, change over the period and volatility. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/stock-analysis" },
};

type Props = { searchParams: Promise<{ symbol?: string; range?: string }> };

export default async function StockAnalysisPage({ searchParams }: Props) {
  const { symbol, range } = await searchParams;
  // ?symbol= comes from shared links and the MCP tool's tool_page. Without it the
  // page opens empty: no ticker is chosen for the visitor.
  const initialSymbol = symbol ? normaliseSymbol(symbol) : null;
  const initialRange: PriceRange = PRICE_RANGES.includes(range as PriceRange) ? (range as PriceRange) : "1y";
  // English on every locale, like the stock screener.
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FinancePlots Stock Price History",
            description:
              "Chart the closing-price history of any stock, index or currency with its 200-day moving average, highs and lows, change over the period and volatility.",
            url: "https://www.financeplots.com/tools/stock-analysis",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            provider: { "@type": "Organization", name: "FinancePlots", url: "https://www.financeplots.com" },
          }),
        }}
      />

      <div className="pt-[100px] pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Stock Analysis</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Price history for any ticker</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Enter a stock, index or currency and pick a period. You get the closing prices with their 200-day
              average, the highest and lowest close, the change over the period and how volatile it has been.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>

          <StockAnalysis initialSymbol={initialSymbol} initialRange={initialRange} />
        </div>
      </div>

      <RelatedTools current="stock-analysis" />
    </main>
  );
}
