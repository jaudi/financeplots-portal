import ScreenerReport from "@/components/ScreenerReport";

export default function QualityScreenerIbex35Page() {
  return (
    <ScreenerReport
      apiPath="/api/screener-ibex35"
      emoji="🇪🇸"
      universeName="IBEX 35"
      relatedSlug="quality-screener-ibex35"
      jsonLdName="IBEX 35 Quality Screener"
      jsonLdDescription="Weekly IBEX 35 screen on quality fundamentals (ROE, P/E, Debt/Equity) and momentum (RSI, MA50), with an AI-generated research report on the companies that pass."
      jsonLdUrl="https://www.financeplots.com/tools/quality-screener-ibex35"
      roaRequired={false}
    />
  );
}
