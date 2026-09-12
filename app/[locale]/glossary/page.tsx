import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Finance Glossary — 32 Key Terms Explained",
  description: "Plain-English definitions of 32 essential finance terms: WACC, EBITDA, DCF, ROE, RSI, PEG, reverse DCF, alpha, break-even, IRR, NPV and more — including every metric used by the FinancePlots screeners.",
  alternates: { canonical: "https://www.financeplots.com/glossary" },
  openGraph: {
    title: "Finance Glossary — 32 Key Terms Explained",
    description: "Plain-English definitions of WACC, EBITDA, DCF, ROE, RSI, PEG, reverse DCF, alpha and 24 more essential finance terms.",
    url: "https://www.financeplots.com/glossary",
    siteName: "FinancePlots",
    type: "website",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
};

interface Term {
  id: string;
  term: string;
  abbr?: string;
  category: "business" | "personal" | "market" | "screener";
  definition: string;
  example: string;
  tool?: { label: string; href: string };
}

const TERMS: Term[] = [
  {
    id: "wacc",
    term: "Weighted Average Cost of Capital",
    abbr: "WACC",
    category: "business",
    definition: "The blended rate a company must earn on its assets to satisfy all its investors — both debt holders and equity shareholders. It weights each source of capital by its proportion in the total capital structure. A lower WACC means cheaper funding and a higher business valuation.",
    example: "If a company is 60% equity-funded (cost 12%) and 40% debt-funded (cost 5% after tax), its WACC is 0.6 × 12% + 0.4 × 5% = 9.2%. Any investment returning more than 9.2% creates value.",
    tool: { label: "Business Valuation", href: "/tools/valuation" },
  },
  {
    id: "ebitda",
    term: "Earnings Before Interest, Tax, Depreciation & Amortisation",
    abbr: "EBITDA",
    category: "business",
    definition: "A measure of a company's core operating profitability, stripping out financing decisions (interest), accounting policies (depreciation, amortisation), and tax. Widely used as a proxy for cash generation and for valuing businesses via EV/EBITDA multiples.",
    example: "A company with £500k revenue, £200k cost of goods, £100k salaries, and £30k depreciation has EBIT of £170k. Adding back depreciation gives EBITDA of £200k.",
    tool: { label: "5-Year Financial Model", href: "/tools/financial-model" },
  },
  {
    id: "dcf",
    term: "Discounted Cash Flow",
    abbr: "DCF",
    category: "business",
    definition: "A valuation method that estimates what a stream of future cash flows is worth today, by discounting them at a rate that reflects risk (typically WACC). The core idea: a pound today is worth more than a pound tomorrow. DCF is the most rigorous way to value a business or investment.",
    example: "If a business will generate £100k of free cash flow each year for 5 years, discounted at 10%, the present value is roughly £379k — not £500k — because future cash is worth less today.",
    tool: { label: "Business Valuation", href: "/tools/valuation" },
  },
  {
    id: "break-even",
    term: "Break-Even Point",
    abbr: undefined,
    category: "business",
    definition: "The level of sales at which total revenue equals total costs — neither profit nor loss. Calculated as Fixed Costs ÷ Contribution Margin per unit. Understanding your break-even is the first step in any pricing or cost decision.",
    example: "A bakery with £5,000/month fixed costs, selling loaves at £4 with £2 variable cost per loaf (£2 contribution margin), must sell 2,500 loaves/month to break even.",
    tool: { label: "Break-Even Analysis", href: "/tools/break-even" },
  },
  {
    id: "compound-interest",
    term: "Compound Interest",
    abbr: undefined,
    category: "personal",
    definition: "Interest calculated on both the initial principal and the accumulated interest from previous periods. Often called the eighth wonder of the world — it turns small, consistent contributions into significant wealth over time. The earlier you start, the more powerful the effect.",
    example: "£10,000 invested at 8% p.a. becomes £46,610 after 20 years. At 30 years it's £100,627 — more than double the 20-year figure for just 10 extra years of patience.",
    tool: { label: "Compound Interest Calculator", href: "/tools/compound-interest" },
  },
  {
    id: "irr",
    term: "Internal Rate of Return",
    abbr: "IRR",
    category: "business",
    definition: "The discount rate that makes the Net Present Value (NPV) of all cash flows from an investment equal to zero. In simple terms: the annualised return you're expected to earn. Compare it to WACC — if IRR > WACC, the investment creates value.",
    example: "Investing £100k today and receiving £140k in 3 years gives an IRR of roughly 11.9%. If your cost of capital is 10%, this investment is worth making.",
    tool: { label: "Business Valuation", href: "/tools/valuation" },
  },
  {
    id: "npv",
    term: "Net Present Value",
    abbr: "NPV",
    category: "business",
    definition: "The sum of all future cash flows from an investment, discounted back to today, minus the initial investment. A positive NPV means the investment creates more value than its cost of capital; negative means it destroys value. It is the gold standard capital allocation metric.",
    example: "A project requires £50k upfront and generates £20k/year for 3 years. At a 10% discount rate, the PV of inflows is £49.7k. NPV = £49.7k − £50k = −£300, meaning you'd just barely not make your hurdle rate.",
    tool: { label: "Business Valuation", href: "/tools/valuation" },
  },
  {
    id: "cash-flow",
    term: "Cash Flow",
    abbr: undefined,
    category: "business",
    definition: "The actual movement of money in and out of a business over a period. Unlike profit (which is an accounting concept), cash flow is real. A profitable business can go bankrupt from poor cash flow. The three types are operating, investing, and financing cash flows.",
    example: "A consultancy invoices £50k in December but isn't paid until February. On paper it's profitable in December, but its bank account is empty — a cash flow gap that must be managed.",
    tool: { label: "13-Week Cash Flow Forecast", href: "/tools/cash-flow" },
  },
  {
    id: "gross-margin",
    term: "Gross Margin",
    abbr: undefined,
    category: "business",
    definition: "Revenue minus Cost of Goods Sold (COGS), expressed as a percentage of revenue. It measures how efficiently a business turns sales into profit before overhead. SaaS companies typically have 70–90% gross margins; manufacturers often 20–40%.",
    example: "A product selling for £100 with £35 in direct costs has a gross margin of (£100 − £35) ÷ £100 = 65%. This 65p of every pound goes toward paying fixed costs and eventually profit.",
    tool: { label: "5-Year Financial Model", href: "/tools/financial-model" },
  },
  {
    id: "burn-rate",
    term: "Burn Rate",
    abbr: undefined,
    category: "business",
    definition: "The rate at which a company spends its cash reserves before generating positive cash flow. Gross burn is total monthly spending; net burn is spending minus revenue. Critical for startups to track — it directly determines runway.",
    example: "A startup with £500k in the bank spending £80k/month in costs and earning £30k/month has a net burn of £50k/month.",
    tool: { label: "13-Week Cash Flow Forecast", href: "/tools/cash-flow" },
  },
  {
    id: "runway",
    term: "Runway",
    abbr: undefined,
    category: "business",
    definition: "The number of months a company can continue operating before running out of cash, assuming no new revenue or funding. Calculated as Cash Reserves ÷ Net Burn Rate. 18 months is often cited as the minimum comfortable runway.",
    example: "The startup above with £500k cash and £50k/month net burn has 10 months of runway. They need to raise, grow revenue, or cut costs within that window.",
    tool: { label: "13-Week Cash Flow Forecast", href: "/tools/cash-flow" },
  },
  {
    id: "working-capital",
    term: "Working Capital",
    abbr: undefined,
    category: "business",
    definition: "Current Assets minus Current Liabilities — the short-term liquidity buffer that keeps a business running day-to-day. Positive working capital means a business can meet its near-term obligations. Negative working capital is a warning sign unless in a business model like supermarkets.",
    example: "A business with £150k in stock, £80k receivables, and £100k payables has working capital of £130k. If payables jump to £250k, working capital turns negative.",
    tool: { label: "Annual Budget", href: "/tools/annual-budget" },
  },
  {
    id: "amortisation",
    term: "Amortisation",
    abbr: undefined,
    category: "business",
    definition: "The gradual write-down of an intangible asset (like a patent or goodwill) or the repayment of a loan over time. For loans, each payment covers both interest and a slice of principal — early payments are mostly interest; later payments are mostly principal.",
    example: "A £200k mortgage at 5% over 25 years amortises so that in year 1, ~70% of each payment is interest; by year 20, ~70% is principal repayment.",
    tool: { label: "Lending Calculator", href: "/tools/lending" },
  },
  {
    id: "pe-ratio",
    term: "Price-to-Earnings Ratio",
    abbr: "P/E",
    category: "market",
    definition: "A stock's share price divided by its earnings per share (EPS). It tells you how much investors are willing to pay for each pound of earnings. A high P/E suggests high growth expectations or overvaluation; a low P/E may indicate undervaluation or structural decline.",
    example: "A stock trading at £50 with EPS of £2.50 has a P/E of 20x. This means investors pay 20 times annual earnings — expensive for a utility, reasonable for a high-growth tech firm.",
    tool: { label: "Stock Analysis", href: "/tools/stock-analysis" },
  },
  {
    id: "roi",
    term: "Return on Investment",
    abbr: "ROI",
    category: "business",
    definition: "A simple percentage measure of the gain or loss from an investment relative to its cost. ROI = (Net Profit ÷ Cost of Investment) × 100. It's quick to calculate but ignores time — use IRR for multi-year comparisons.",
    example: "Spending £10k on a marketing campaign that generates £35k in new revenue (with £15k variable costs) yields a net profit of £20k and an ROI of 200%.",
    tool: { label: "5-Year Financial Model", href: "/tools/financial-model" },
  },
  {
    id: "ebit",
    term: "Earnings Before Interest & Tax",
    abbr: "EBIT",
    category: "business",
    definition: "Operating profit — revenue minus all operating costs including depreciation, but before interest expense and income tax. It measures a company's profitability from core operations, independent of how it is financed or where it pays tax.",
    example: "A company earning £1m in revenue with £700k operating costs and £50k depreciation has EBIT of £250k. Whether it has debt (and pays interest) doesn't affect this number.",
    tool: { label: "5-Year Financial Model", href: "/tools/financial-model" },
  },
  {
    id: "leverage",
    term: "Leverage",
    abbr: undefined,
    category: "business",
    definition: "Using borrowed capital (debt) to amplify potential investment returns. Financial leverage magnifies both gains and losses. A Debt-to-Equity ratio above 1x is considered leveraged; above 3x is considered highly leveraged and riskier.",
    example: "Buying a £200k property with £50k equity and £150k mortgage is 3x leverage. A 10% rise in property value (£20k) is a 40% return on equity — but a 10% fall means losing 40% of your equity.",
    tool: { label: "Lending Calculator", href: "/tools/lending" },
  },
  {
    id: "liquidity",
    term: "Liquidity",
    abbr: undefined,
    category: "business",
    definition: "How quickly and easily an asset can be converted to cash without losing value. Cash is perfectly liquid; real estate is illiquid. For businesses, the Current Ratio (Current Assets ÷ Current Liabilities) measures short-term liquidity — below 1.0 is a red flag.",
    example: "A company with £200k cash, £100k receivables, and £150k payables has a current ratio of 2.0 — healthy. If it had £400k payables instead, current ratio drops to 0.75 — dangerously illiquid.",
    tool: { label: "13-Week Cash Flow Forecast", href: "/tools/cash-flow" },
  },
  {
    id: "contribution-margin",
    term: "Contribution Margin",
    abbr: undefined,
    category: "business",
    definition: "Revenue minus variable costs — the amount each unit sold contributes toward covering fixed costs and generating profit. It is the building block of break-even analysis and pricing decisions. As a percentage of revenue it is called the Contribution Margin Ratio.",
    example: "Selling a product at £80 with £30 in variable costs gives a £50 contribution margin (62.5% CMR). Every unit sold contributes £50 toward the £10,000 fixed cost base — you need 200 units to break even.",
    tool: { label: "Break-Even Analysis", href: "/tools/break-even" },
  },
  {
    id: "savings-rate",
    term: "Savings Rate",
    abbr: undefined,
    category: "personal",
    definition: "The percentage of take-home income that is saved or invested each month. It is one of the most powerful levers in personal finance — it determines how fast you build wealth and how long until you achieve financial independence. Most financial advisers target 15–20%.",
    example: "Earning £4,000/month and saving £800 gives a 20% savings rate. Increasing to 30% (£1,200/month) invested at 8% p.a. can cut the time to financial independence by over a decade.",
    tool: { label: "Personal Financial Planner", href: "/tools/financial-planner" },
  },
  {
    id: "roe",
    term: "Return on Equity",
    abbr: "ROE",
    category: "screener",
    definition: "Net profit divided by shareholders' equity — how much profit a company generates from the money its owners have put in. A high ROE usually signals a strong competitive position, but it can also be manufactured with debt: borrowing shrinks the equity base and inflates the ratio without the business improving at all. That is why a quality screen should always pair ROE with a leverage check.",
    example: "A company earning £50m on £200m of equity has a 25% ROE. If it buys back £100m of stock with borrowed money, equity halves and ROE jumps to 50% — the same profit, a better-looking ratio, and a more fragile balance sheet.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "roa",
    term: "Return on Assets",
    abbr: "ROA",
    category: "screener",
    definition: "Net profit divided by total assets — profit generated per unit of everything the company controls, borrowed or owned. Because the denominator includes debt-funded assets, ROA cannot be inflated by leverage the way ROE can, which makes the two useful together. It is highly sector-dependent: a software firm and a utility are not comparable on it.",
    example: "The FinancePlots S&P 500 screen requires ROA above 12%, but the IBEX 35 screen does not apply it at all — the Spanish index is heavy with banks and utilities, where a low ROA is structural to the business model rather than a sign of poor quality.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "debt-to-equity",
    term: "Debt-to-Equity Ratio",
    abbr: "D/E",
    category: "screener",
    definition: "Total debt divided by shareholders' equity — how much of the business is funded by lenders versus owners. It is a blunt instrument: it is a snapshot that says nothing about when the debt matures or whether profits comfortably cover the interest. A company at 80% with debt due next year is more fragile than one at 120% with nothing due until 2032.",
    example: "A D/E of 100% means £1 of debt for every £1 of equity. The FinancePlots quality screens reject anything above that, mainly to filter out companies whose high ROE is an artefact of leverage rather than a good business.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "free-cash-flow",
    term: "Free Cash Flow",
    abbr: "FCF",
    category: "screener",
    definition: "The cash left after a company has paid its operating costs and its capital expenditure — money genuinely available to repay debt, pay dividends or reinvest. It is harder to manipulate than reported earnings, because accounting judgement affects profit far more than it affects cash. A business whose profits keep rising while its free cash flow does not is one worth looking at closely.",
    example: "The Nasdaq-100 growth screen requires positive free cash flow as its only quality guardrail — the line between growth that funds itself and growth that burns cash. It doubles as a practical requirement: the reverse DCF cannot run on a negative cash flow base.",
    tool: { label: "Nasdaq-100 Growth Screener", href: "/tools/growth-screener-nasdaq100" },
  },
  {
    id: "peg",
    term: "Price/Earnings to Growth Ratio",
    abbr: "PEG",
    category: "screener",
    definition: "The P/E ratio divided by the earnings growth rate. Peter Lynch popularised it on the logic that a P/E means nothing without knowing how fast the company is growing: a business on 30x growing at 30% (PEG 1.0) is cheaper per unit of growth than one on 15x growing at 5% (PEG 3.0). Its weakness is the denominator — a company rebounding from a cyclical trough shows enormous growth and a flatteringly low PEG at precisely the wrong moment.",
    example: "A fertiliser producer whose earnings rose 99% off a trough shows a PEG of 0.10, the lowest of any name on the screen — not because it is cheap, but because the denominator is a one-off rebound. Using normalised multi-year earnings instead of the last twelve months is the standard fix.",
    tool: { label: "Nasdaq-100 Growth Screener", href: "/tools/growth-screener-nasdaq100" },
  },
  {
    id: "rsi",
    term: "Relative Strength Index",
    abbr: "RSI",
    category: "screener",
    definition: "A momentum oscillator from 0 to 100 that compares the size of recent gains to recent losses over a period, usually 14 days. Readings below 30 conventionally suggest oversold conditions and above 70 overbought. It measures the behaviour of the price, not the business — a company can have a perfect RSI and deteriorating fundamentals, and nothing in the indicator would know.",
    example: "The FinancePlots screens use RSI as a floor rather than a range — above 30 for the quality screens, above 40 for growth — to exclude names in distress, with no upper bound, so that strong momentum is not penalised by the very filter meant to find it.",
    tool: { label: "Nasdaq-100 Growth Screener", href: "/tools/growth-screener-nasdaq100" },
  },
  {
    id: "moving-average",
    term: "Moving Average",
    abbr: "MA50 / MA200",
    category: "screener",
    definition: "The average closing price over a trailing window, used to smooth out daily noise and show the underlying direction. The 50-day is the medium-term trend and the 200-day the long-term one. When the 50-day sits above the 200-day the market calls it a golden cross; the reverse is a death cross. The distinction matters: a price can recover its 50-day in any two-week bounce, while the crossing of the two averages takes months to turn.",
    example: "The Nasdaq-100 growth screen requires both — price above the 50-day and the 50-day above the 200-day — precisely so that a short-lived rally in a falling stock does not register as an uptrend.",
    tool: { label: "Nasdaq-100 Growth Screener", href: "/tools/growth-screener-nasdaq100" },
  },
  {
    id: "momentum",
    term: "Momentum",
    abbr: undefined,
    category: "screener",
    definition: "The tendency of assets that have performed well recently to keep performing well over the following months. It is one of the most persistently documented anomalies in finance, and also one of the most uncomfortable: it offers no explanation of why it works, it contradicts the value investor's instinct to buy what has fallen, and it reverses sharply and without warning.",
    example: "Requiring a positive 6-month return alongside the moving-average conditions is a momentum filter. It is the reason a value investor would object to these screens on principle — buying what has already risen is the opposite of buying what is cheap.",
    tool: { label: "Nasdaq-100 Growth Screener", href: "/tools/growth-screener-nasdaq100" },
  },
  {
    id: "reverse-dcf",
    term: "Reverse Discounted Cash Flow",
    abbr: "Reverse DCF",
    category: "screener",
    definition: "Instead of forecasting cash flows to produce a fair value, a reverse DCF starts from today's market price and solves for the growth rate that would justify it. The output is not a prediction — it is a statement of what the market is currently assuming. It reframes the question from \"what is this worth?\" to \"what would have to be true for this price to make sense?\", which is a far harder thing to fool yourself about.",
    example: "If a company's price implies 40% annual cash flow growth for a decade while the business has actually compounded at 12%, the gap is the question. The implied figure is available for every company, because unlike a forecast it requires no history at all.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "r-squared",
    term: "Coefficient of Determination",
    abbr: "R²",
    category: "screener",
    definition: "How much of the variation in a series is explained by a fitted trend line, from 0 to 1. In cash flow analysis it answers a question that comes before growth rates: do these numbers behave like a trend at all, or is the apparent growth just the path a volatile series happened to take? A CAGR can be computed from any two endpoints and will happily describe a collapse-and-rebound as steady compounding; R² is what catches that.",
    example: "The FinancePlots valuation stage refuses to project anything below an R² of 0.5, leaving the fair value blank with a stated reason. On a typical week that is four companies out of five — which is the correct outcome, not a bug.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "terminal-value",
    term: "Terminal Value",
    abbr: "TV",
    category: "screener",
    definition: "The portion of a valuation attributable to every year beyond the explicit forecast window, usually calculated as a perpetuity growing at a low fixed rate. It is the least examined and often the largest part of a DCF: when the terminal share exceeds half the total, most of the valuation rests on a single assumption about the distant future rather than on anything analysed.",
    example: "A 2.5% terminal growth rate is applied uniformly across a miner, a biotech and a software firm, none of which plausibly share a long-run growth ceiling. The screener reports the terminal share per company so the reader can see how much of each number that one assumption is carrying.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
  {
    id: "alpha",
    term: "Alpha",
    abbr: undefined,
    category: "screener",
    definition: "Return in excess of a benchmark over the same period. It is the only number that justifies picking individual stocks at all: if a strategy returns 8% while its index returns 10%, the strategy lost, however positive it looks in isolation. Alpha is also the figure most often quietly omitted — a portfolio return with no benchmark beside it is not a result, it is a decoration.",
    example: "A screen returning -3.7% while its index returned -0.7% has an alpha of -3.0 percentage points. Judging it on the -3.7% alone tells you about the market; the comparison is what tells you about the screen.",
    tool: { label: "S&P 500 Quality Screener", href: "/tools/quality-screener" },
  },
];

const CATEGORY_LABELS: Record<Term["category"], string> = {
  business: "Business & Corporate Finance",
  personal: "Personal Finance",
  market: "Markets & Investing",
  screener: "Screener Metrics",
};

const CATEGORY_COLORS: Record<Term["category"], string> = {
  business: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  personal: "bg-green-500/10 text-green-300 border-green-500/20",
  market: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  screener: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
};

type Props = { params: Promise<{ locale: string }> };

export default async function GlossaryPage({ params }: Props) {
  const { locale } = await params;
  const es = locale === "es";

  const title = es ? "Glosario de Finanzas" : "Finance Glossary";
  const subtitle = es
    ? "Los 20 términos más importantes de las finanzas, explicados en lenguaje sencillo."
    : "32 essential finance terms, explained in plain English — including every metric behind the screeners.";

  const termsByLetter = TERMS.reduce<Record<string, Term[]>>((acc, term) => {
    const letter = (term.abbr ?? term.term)[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});
  const letters = Object.keys(termsByLetter).sort();

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-24 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "name": "Finance Glossary",
          "description": "Plain-English definitions of key finance terms including WACC, EBITDA, DCF, break-even, compound interest, and more.",
          "url": "https://www.financeplots.com/glossary",
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" },
          "hasDefinedTerm": TERMS.map(t => ({
            "@type": "DefinedTerm",
            "name": t.abbr ? `${t.abbr} (${t.term})` : t.term,
            "description": t.definition,
            "inDefinedTermSet": "https://www.financeplots.com/glossary",
          })),
        })}}
      />

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">Reference</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">{title}</h1>
        <p className="text-gray-400 text-center mb-4">{subtitle}</p>

        {/* Category legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {(Object.keys(CATEGORY_LABELS) as Term["category"][]).map(cat => (
            <span key={cat} className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[cat]}`}>
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        {/* Jump links */}
        <div className="flex flex-wrap gap-1.5 mb-12 justify-center">
          {letters.map(l => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:border-blue-500 hover:text-blue-400 text-sm font-bold text-gray-400 transition"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Terms */}
        <div className="space-y-16">
          {letters.map(letter => (
            <div key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-extrabold text-blue-400">{letter}</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
              <div className="space-y-6">
                {termsByLetter[letter].map(term => (
                  <article
                    key={term.id}
                    id={term.id}
                    className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 scroll-mt-24"
                  >
                    {/* Term header */}
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        {term.abbr ? (
                          <h2 className="text-white font-bold text-xl">
                            {term.abbr}
                            <span className="text-gray-500 text-base font-normal ml-2">— {term.term}</span>
                          </h2>
                        ) : (
                          <h2 className="text-white font-bold text-xl">{term.term}</h2>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${CATEGORY_COLORS[term.category]}`}>
                        {CATEGORY_LABELS[term.category]}
                      </span>
                    </div>

                    {/* Definition */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{term.definition}</p>

                    {/* Example */}
                    <div className="bg-[#070d1a] border border-gray-700/50 rounded-xl px-5 py-4 mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Example</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{term.example}</p>
                    </div>

                    {/* Tool link */}
                    {term.tool && (
                      <Link
                        href={term.tool.href}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                      >
                        Try it → {term.tool.label}
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center border-t border-gray-800 pt-16">
          <p className="text-gray-400 mb-6 text-sm">
            {es
              ? "Aplica estos conceptos con nuestras herramientas gratuitas."
              : "Put these concepts into practice with our free tools."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-600/25"
            >
              {es ? "Ver todas las herramientas →" : "Explore all tools →"}
            </Link>
            <Link
              href="/quiz"
              className="inline-block border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200 font-bold px-8 py-4 rounded-xl transition"
            >
              {es ? "🧠 Pon a prueba tu conocimiento →" : "🧠 Test your knowledge →"}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
