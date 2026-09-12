import ScreenerReport from "@/components/ScreenerReport";

export default function GrowthScreenerNasdaq100Page() {
  return (
    <ScreenerReport
      apiPath="/api/screener-nasdaq100"
      emoji="🚀"
      universeName="Nasdaq-100"
      relatedSlug="growth-screener-nasdaq100"
      jsonLdName="Nasdaq-100 Growth Screener"
      jsonLdDescription="Weekly Nasdaq-100 screen on growth (revenue and earnings growth, positive free cash flow) and momentum (MA50, MA200, 6-month return, RSI), with an AI-generated research report on the companies that pass."
      jsonLdUrl="https://www.financeplots.com/tools/growth-screener-nasdaq100"
      performanceKey="nasdaq100"
      variant="growth"
    />
  );
}
