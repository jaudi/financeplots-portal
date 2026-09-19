import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import StockComparison from "@/components/StockComparison";
import RelatedTools from "@/components/RelatedTools";
import { normaliseSymbol, PRICE_RANGES, type PriceRange } from "@/lib/price-types";

export const metadata: Metadata = {
  title: "Stock Comparison — Compare Up to Four Tickers on One Chart",
  description:
    "Compare the price performance of up to four stocks, indices or currencies, rebased to 100: change over the period, annualised return, volatility, largest fall and correlation. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/stock-comparison" },
};

type Props = { searchParams: Promise<{ symbols?: string; range?: string }> };

export default async function StockComparisonPage({ searchParams }: Props) {
  const { symbols, range } = await searchParams;
  // ?symbols= comes from shared links. Without it the page opens empty: no
  // tickers are chosen for the visitor.
  const initialSymbols = [
    ...new Set((symbols ?? "").split(",").map((s) => normaliseSymbol(s)).filter((s): s is string => s !== null)),
  ].slice(0, 4);
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
            name: "FinancePlots Stock Comparison",
            description:
              "Compare the price performance of up to four stocks, indices or currencies rebased to 100, with annualised return, volatility, largest fall and correlation.",
            url: "https://www.financeplots.com/tools/stock-comparison",
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
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Stock Comparison</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Compare how prices moved</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Enter two to four stocks, indices or currencies and pick a period. Each one starts at 100 on the same
              day, so you can see how they moved against each other — with the return, volatility, largest fall and
              how closely they moved together.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>

          <StockComparison initialSymbols={initialSymbols} initialRange={initialRange} />
        </div>
      </div>

      <RelatedTools current="stock-comparison" />
    </main>
  );
}
