import ScreenerReport from "@/components/ScreenerReport";

export default function QualityScreenerPage() {
  return (
    <ScreenerReport
      apiPath="/api/screener"
      emoji="🏆"
      universeName="S&P 500"
      relatedSlug="quality-screener"
      jsonLdName="S&P 500 Quality Screener"
      jsonLdDescription="Weekly S&P 500 screen on quality fundamentals (ROE, ROA, P/E) and momentum (RSI, MA50), with an AI-generated research report on the companies that pass."
      jsonLdUrl="https://www.financeplots.com/tools/quality-screener"
    />
  );
}
