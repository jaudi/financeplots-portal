import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import StockScreener from "@/components/StockScreener";
import RelatedTools from "@/components/RelatedTools";
import { UNIVERSE_SCREENS, type UniverseScreen } from "@/lib/universe";

export const metadata: Metadata = {
  title: "Stock Screener — Set Your Own Criteria for the S&P 500, Nasdaq-100 and IBEX 35",
  description:
    "Choose your own criteria — valuation, profitability, debt, growth and price trend — and filter every company in the S&P 500, Nasdaq-100 or IBEX 35. Nothing is ranked or picked for you. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/stock-screener" },
};

type Props = { searchParams: Promise<{ index?: string }> };

export default async function StockScreenerPage({ searchParams }: Props) {
  const { index } = await searchParams;
  // The retired index screener URLs redirect here with ?index= so the visitor
  // lands on the index they came for. Anything else falls back to the S&P 500.
  const initialIndex: UniverseScreen = UNIVERSE_SCREENS.includes(index as UniverseScreen)
    ? (index as UniverseScreen)
    : "sp500";
  // English on every locale: the rest of this tool is English-only, and a
  // Spanish disclaimer above an English tool reads as two different pages.
  const tc = await getTranslations({ locale: "en", namespace: "toolCommon" });

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FinancePlots Stock Screener",
            description:
              "Filter the S&P 500, Nasdaq-100 or IBEX 35 on criteria you choose — valuation, profitability, debt, growth and price trend.",
            url: "https://www.financeplots.com/tools/stock-screener",
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
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Stock Screener</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Set the criteria. See what meets them.
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Pick an index, choose the measures that matter to you and the limits you want, then run the
              screen. The results are simply the companies that meet your criteria — FinancePlots doesn&apos;t
              score, rank or select anything, and nothing is shown until you run it.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>

          <StockScreener initialIndex={initialIndex} />
        </div>
      </div>

      <RelatedTools current="stock-screener" />
    </main>
  );
}
