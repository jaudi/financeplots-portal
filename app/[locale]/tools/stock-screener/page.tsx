import type { Metadata } from "next";
import UniverseScreener from "@/components/UniverseScreener";
import RelatedTools from "@/components/RelatedTools";

export const metadata: Metadata = {
  title: "Stock Screener — Filter the S&P 500, Nasdaq-100 and IBEX 35",
  description:
    "Browse every company in the S&P 500, Nasdaq-100 and IBEX 35 scored on five factors — value, quality, growth, momentum and what the price already assumes. Set your own minimums. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/stock-screener" },
};

export default function StockScreenerPage() {
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
              "Interactive screener across the S&P 500, Nasdaq-100 and IBEX 35, scoring every company on value, quality, growth, momentum and expectations.",
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
              Every company, scored on five things
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Nothing is filtered out before you see it. Every company in the index is ranked against every
              other on value, quality, growth, momentum and what its price already assumes — then you set
              the minimums that matter to you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ A score is a position, not a verdict</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Each score is a percentile rank within its index this week — 70 means &ldquo;higher than 70% of
              this index&rdquo;, not &ldquo;good&rdquo;. A company&apos;s score moves when other companies move.
              Nothing here is a recommendation to buy or sell.
            </p>
          </div>

          <UniverseScreener />
        </div>
      </div>

      <RelatedTools current="stock-screener" />
    </main>
  );
}
