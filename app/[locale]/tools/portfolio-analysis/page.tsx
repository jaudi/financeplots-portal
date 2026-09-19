import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PortfolioAnalysis, { type HoldingRow } from "@/components/PortfolioAnalysis";
import RelatedTools from "@/components/RelatedTools";
import { fetchIndicators } from "@/lib/fred";
import { normaliseSymbol, type PriceRange } from "@/lib/price-types";

export const metadata: Metadata = {
  title: "Portfolio Analysis — Return, Volatility, Sharpe Ratio and VaR for Your Holdings",
  description:
    "Enter up to eight stocks, ETFs or indices with their weights and see the portfolio's historical return, volatility, Sharpe ratio, largest fall, value at risk and each holding's share of the risk. Free, no signup.",
  alternates: { canonical: "https://www.financeplots.com/tools/portfolio-analysis" },
};

const RANGES: PriceRange[] = ["6m", "1y", "5y", "max"];
const FALLBACK_RISK_FREE = 4;

type Props = { searchParams: Promise<{ h?: string; range?: string; rf?: string }> };

/** The Fed funds rate from FRED as a default for the Sharpe ratio; the visitor can change it. */
async function defaultRiskFree(): Promise<{ rate: number; note: string }> {
  const apiKey = process.env.FRED_API_KEY;
  if (apiKey) {
    try {
      const fed = (await fetchIndicators(apiKey)).find((i) => i.label === "Fed Funds Rate");
      if (fed) {
        const [y, m, d] = fed.date.split("-");
        const month = new Date(Date.UTC(+y, +m - 1, +d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
        return { rate: Math.round(fed.value * 100) / 100, note: `Defaults to the US Fed funds rate (${month}, FRED).` };
      }
    } catch {
      // fall through to the fixed default
    }
  }
  return { rate: FALLBACK_RISK_FREE, note: `Defaults to ${FALLBACK_RISK_FREE}%.` };
}

export default async function PortfolioAnalysisPage({ searchParams }: Props) {
  const { h, range, rf } = await searchParams;
  // ?h=AAPL:40,SAN.MC:60 comes from shared links. Without it the page opens with
  // empty rows: no holdings are chosen for the visitor.
  const initialRows: HoldingRow[] = (h ?? "")
    .split(",")
    .map((pair) => {
      const [sym, w] = pair.split(":");
      const symbol = normaliseSymbol(sym ?? "");
      const weight = Number(w);
      return symbol && Number.isFinite(weight) && weight > 0 ? { symbol, weight: String(weight) } : null;
    })
    .filter((r): r is HoldingRow => r !== null)
    .slice(0, 8);
  const initialRange: PriceRange = RANGES.includes(range as PriceRange) ? (range as PriceRange) : "1y";
  const fallback = await defaultRiskFree();
  const sharedRf = rf !== undefined && Number.isFinite(Number(rf)) ? Number(rf) : null;
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
            name: "FinancePlots Portfolio Analysis",
            description:
              "Historical return, volatility, Sharpe ratio, largest fall, value at risk and risk contribution for a portfolio of up to eight stocks, ETFs or indices.",
            url: "https://www.financeplots.com/tools/portfolio-analysis",
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
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Portfolio Analysis</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">How your portfolio behaved</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Enter your holdings and their weights. See the portfolio&apos;s return, volatility, Sharpe ratio, largest
              fall and value at risk over the period you choose — and how much of the risk each holding really
              carries. Everything is historical; nothing here is a forecast.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>

          <PortfolioAnalysis
            initialRows={initialRows}
            initialRange={initialRange}
            initialRiskFree={sharedRf ?? fallback.rate}
            riskFreeNote={sharedRf === null ? fallback.note : "Taken from the shared link."}
          />
        </div>
      </div>

      <RelatedTools current="portfolio-analysis" />
    </main>
  );
}
