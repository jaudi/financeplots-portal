import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import BlogArticleShell from "@/components/BlogArticleShell";

// Educational only: describes how each investor's published approach works.
// Never name a security or give price levels here (UK MAR — see CLAUDE.md).

const URL = "https://www.financeplots.com/blog/famous-investor-playbooks";
const TITLE = "Ten Famous Investors, Ten Ways to Hold a Share";
const DESCRIPTION =
  "Simons, Buffett, Graham, Lynch, O'Neil and five more: what each one looks for, when they sell, and how long they expect to hold. Why your holding period should choose the method.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: "FinancePlots",
    type: "article",
    images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.financeplots.com/og-image.png"],
  },
  alternates: { canonical: URL },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  url: URL,
  datePublished: "2026-09-29",
  image: "https://www.financeplots.com/og-image.png",
  author: { "@type": "Organization", name: "FinancePlots" },
  publisher: {
    "@type": "Organization",
    name: "FinancePlots",
    logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": URL },
};

type Horizon = "short" | "medium" | "long";

interface Playbook {
  who: string;
  style: string;
  horizon: Horizon;
  weeks: [number, number]; // typical holding period, in weeks
  idea: string;
  looks: string;
  exit: string;
}

const PLAYBOOKS: Playbook[] = [
  {
    who: "Jim Simons", style: "Short-term statistical patterns", horizon: "short", weeks: [1.5, 5],
    idea: "Pure mathematics, no opinions about companies. Find tiny, repeatable patterns in prices and trade thousands of them at once, so a small edge adds up.",
    looks: "Price only — short-term oversold readings (RSI), distance from moving averages, recent volatility. Valuation is ignored.",
    exit: "Mechanical and fast. The pattern plays out within days or the position is closed.",
  },
  {
    who: "Paul Tudor Jones", style: "Trend-following", horizon: "short", weeks: [2, 13],
    idea: "A macro trader obsessed with defence: follow the trend, look for trades that can pay five times what they risk, and cut losers without debate.",
    looks: "Price above its 200-day moving average and a strong established trend, ideally backed by rising earnings.",
    exit: "“Nothing good happens below the 200-day.” A close under the average ends the trade.",
  },
  {
    who: "William O'Neil", style: "CAN SLIM growth leaders", horizon: "short", weeks: [3, 26],
    idea: "Buy the fastest-growing companies in the leading industry groups as they break out to new highs.",
    looks: "Strong current and annual earnings growth, price near its highs, a leading industry group — but not stretched far above its averages.",
    exit: "Sell any position that falls 7–8% below the buy price. No exceptions.",
  },
  {
    who: "Stanley Druckenmiller", style: "Macro-driven concentrated bets", horizon: "short", weeks: [3, 52],
    idea: "Top-down macro: find the dominant economic and liquidity theme, concentrate heavily in it, and protect capital first.",
    looks: "The companies at the centre of that theme — high returns on capital, fast earnings growth, momentum that has cooled rather than overheated.",
    exit: "When the macro thesis changes — rates, liquidity, the cycle — get out fast, whatever the position has done.",
  },
  {
    who: "Peter Lynch", style: "Growth at a reasonable price", horizon: "medium", weeks: [26, 156],
    idea: "Buy what you know, and sort companies into types — fast growers, stalwarts, cyclicals — because each needs a different approach.",
    looks: "A PEG ratio (P/E divided by earnings growth) below 1, a business you understand, and cash flow that backs up the reported earnings.",
    exit: "When the story changes: growth slows, the P/E runs far ahead of growth, or the reason you bought no longer holds.",
  },
  {
    who: "Joel Greenblatt", style: "The Magic Formula", horizon: "long", weeks: [52, 60],
    idea: "Rank companies on two numbers at once, buy a basket of the best-ranked, and stick with it through bad stretches.",
    looks: "High return on capital plus a high earnings yield (EBIT divided by enterprise value), ranked together across the market.",
    exit: "Rebalance after about a year. Built for a basket of 20–30 shares, and can lag the market two or three years running.",
  },
  {
    who: "Benjamin Graham", style: "Deep value, margin of safety", horizon: "long", weeks: [52, 156],
    idea: "The father of value investing: buy well below intrinsic or book value, diversify widely, and treat Mr. Market's mood swings as opportunities.",
    looks: "P/E × price-to-book below 22.5 (his published ceiling), low debt, and a long record of profits and dividends.",
    exit: "When the price reaches a fair estimate of value — or after two to three years if it never does.",
  },
  {
    who: "Howard Marks", style: "Contrarian, cycle-aware", horizon: "long", weeks: [104, 260],
    idea: "Second-level thinking: know where we are in the cycle, control risk before chasing return, and be greedy only when the pendulum has swung to fear.",
    looks: "Solid businesses priced as if they are shrinking — low P/E, high free-cash-flow yield, heavy falls amid widespread pessimism.",
    exit: "When the consensus has come round and the price no longer offers a margin of safety.",
  },
  {
    who: "Cathie Wood", style: "Disruptive innovation", horizon: "long", weeks: [156, 260],
    idea: "Back the companies expected to define the next decade, on a five-year view, and accept extreme volatility along the way.",
    looks: "Very fast revenue growth in new technology platforms. Current profits and valuation matter less than the size of the opportunity.",
    exit: "Rarely on price — the approach adds on weakness. Out when the innovation thesis itself breaks.",
  },
  {
    who: "Warren Buffett", style: "Quality at a fair price", horizon: "long", weeks: [260, 520],
    idea: "Wonderful businesses at fair prices: durable competitive advantages, honest management and high returns on capital.",
    looks: "Consistently high return on capital, stable margins, low debt, and a price that is fair rather than cheap.",
    exit: "“Our favourite holding period is forever” — sell only if the business itself deteriorates.",
  },
];

const HORIZON_STYLE: Record<Horizon, { bar: string; pill: string; label: string }> = {
  short: { bar: "bg-teal-400", pill: "bg-teal-500/10 text-teal-300 border-teal-500/30", label: "Weeks" },
  medium: { bar: "bg-amber-400", pill: "bg-amber-500/10 text-amber-300 border-amber-500/30", label: "Months to years" },
  long: { bar: "bg-indigo-400", pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30", label: "Years" },
};

// Log scale from 1 week to 10 years, shared by bars, ticks and the marker.
const MIN_W = 1;
const MAX_W = 520;
const pos = (w: number) => (Math.log(w / MIN_W) / Math.log(MAX_W / MIN_W)) * 100;
const TICKS: [number, string][] = [[1, "1 wk"], [4, "1 mo"], [13, "3 mo"], [52, "1 yr"], [260, "5 yr"], [520, "10 yr"]];

function HorizonChart() {
  return (
    <div className="not-prose bg-[#0d1426] border border-gray-800 rounded-xl p-5 overflow-x-auto">
      <p className="text-white font-semibold text-sm mb-1">Typical holding period, log scale</p>
      <p className="text-gray-500 text-xs mb-6">The dashed line is a three-week trade. Only four of the ten methods were built to reach it.</p>
      <div className="min-w-[560px]">
        <div className="relative">
          {PLAYBOOKS.map(p => (
            <div key={p.who} className="flex items-center h-7">
              <span className="w-40 shrink-0 text-xs text-gray-300 truncate pr-2">{p.who}</span>
              <div className="relative flex-1 h-full">
                <div
                  className={`absolute top-2 h-3 rounded-full ${HORIZON_STYLE[p.horizon].bar}`}
                  style={{ left: `${pos(p.weeks[0])}%`, width: `${Math.max(pos(p.weeks[1]) - pos(p.weeks[0]), 1.2)}%` }}
                />
              </div>
            </div>
          ))}
          <div className="absolute inset-y-0 left-40 right-0 pointer-events-none">
            <div className="absolute inset-y-0 border-l-2 border-dashed border-red-400" style={{ left: `${pos(3)}%` }}>
              <span className="absolute -top-5 left-1.5 text-[11px] font-semibold text-red-400 whitespace-nowrap">3 weeks</span>
            </div>
          </div>
        </div>
        <div className="relative h-6 ml-40 border-t border-gray-700 mt-1">
          {TICKS.map(([w, label]) => (
            <span key={label} className="absolute top-1 -translate-x-1/2 text-[11px] text-gray-500 whitespace-nowrap" style={{ left: `${pos(w)}%` }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaybookCard({ p }: { p: Playbook }) {
  const s = HORIZON_STYLE[p.horizon];
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-bold">{p.who}</p>
          <p className="text-gray-500 text-xs">{p.style}</p>
        </div>
        <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 whitespace-nowrap ${s.pill}`}>{s.label}</span>
      </div>
      <p className="text-sm text-gray-300">{p.idea}</p>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">What a screen looks for</p>
        <p className="text-sm text-gray-300 mt-0.5">{p.looks}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">When they get out</p>
        <p className="text-sm text-gray-300 mt-0.5">{p.exit}</p>
      </div>
    </div>
  );
}

export default function ArticleFamousInvestorPlaybooks() {
  const group = (h: Horizon) => PLAYBOOKS.filter(p => p.horizon === h);
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <BlogArticleShell>

        <Link href="/blog" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
          ← Back to Blog
        </Link>

        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Guide</span>
        <h1 className="text-4xl font-bold mt-2 mb-3 leading-tight">{TITLE}</h1>
        <p className="text-gray-400 text-sm mb-10">September 2026 · 6 min read</p>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-6">

          <p>
            Ask ten famous investors what makes a share worth buying and you get ten different answers. Ask them how
            long they plan to hold it and the answers range from a few days to &ldquo;forever&rdquo;. That second
            question matters more than it looks: <strong className="text-white">the holding period decides which
            method makes sense at all</strong>.
          </p>
          <p>
            We translated ten well-known approaches into the numbers a stock screener can test — valuation, return on
            capital, growth, price trend — and lined them up by how long each expects to hold. This is what that
            exercise teaches, without naming a single stock.
          </p>

          <HorizonChart />

          <h2 className="text-2xl font-bold text-white mt-10">Built for weeks: the traders</h2>
          <p>
            Four of the ten were designed for short holding periods. They disagree about almost everything — a
            mathematician, a trend follower, a growth chartist and a macro investor — but they share one habit: a
            hard rule for getting out.
          </p>
          <div className="not-prose grid md:grid-cols-2 gap-4">
            {group("short").map(p => <PlaybookCard key={p.who} p={p} />)}
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">In between: growth at a reasonable price</h2>
          <p>
            Peter Lynch sits in the middle. His PEG ratio can flag an interesting company in an afternoon, but the
            payoff — earnings growth being recognised by the market — usually takes quarters or years to arrive.
          </p>
          <div className="not-prose grid md:grid-cols-2 gap-4">
            {group("medium").map(p => <PlaybookCard key={p.who} p={p} />)}
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">Built for years: the investors</h2>
          <p>
            The other five are explicitly long-term. For them a three-week price move is noise: the thesis is about
            what the business earns over years, and several of these methods are known to lag the market for long
            stretches before they pay.
          </p>
          <div className="not-prose grid md:grid-cols-2 gap-4">
            {group("long").map(p => <PlaybookCard key={p.who} p={p} />)}
          </div>

          <div className="not-prose bg-gradient-to-br from-amber-900/20 to-red-900/10 border border-amber-700/30 rounded-xl p-5">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">Bonus: a Spanish value investor — Francisco García Paramés</p>
            <p className="text-sm text-gray-300">
              Often called &ldquo;the Spanish Buffett&rdquo;, Paramés ran Bestinver&apos;s funds from 1993 to 2014 and
              later founded Cobas Asset Management. His book <em>Invirtiendo a largo plazo</em> (<em>Investing for the Long Term</em>) sets out a value
              approach close to Graham&apos;s and Marks&apos;s, with two traits of its own.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
              <li><strong className="text-white">Looks for:</strong> good businesses the market ignores or dislikes — often industrial, cyclical or little-followed companies — trading well below his estimate of their value.</li>
              <li><strong className="text-white">Gets out:</strong> when the price approaches that value, rotating the money into whatever now offers the most upside — so the portfolio changes even though each thesis is long-term.</li>
              <li><strong className="text-white">Horizon:</strong> years, typically three to five, with a willingness to look wrong for a long time before being proved right.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10">What running all ten side by side teaches</h2>
          <ol className="space-y-3 list-none pl-0">
            {[
              ["Decide the horizon first.", "The holding period chooses the method, not the other way round. A value screen judged over three weeks is judged on noise; a mean-reversion signal held for a year has long since expired."],
              ["Short trades live on the exit rule.", "Every short-horizon method here has a hard rule for getting out — a close below a moving average, a fixed 7–8% loss. Without one, a short trade quietly becomes a long one nobody planned."],
              ["Cheap on every measure is a question.", "When one company passes several value screens at once, either the market is wrong or it sees a threat the past numbers don't show yet. Second-level thinking means asking which."],
              ["Different screens can be the same bet.", "Methods that look unrelated often land in the same sector or the same economic cycle. Ten strategies can still add up to two or three bets, so check what you would really own."],
              ["Rates set the bar.", "When government bonds pay 5%, a share has to beat that before it is worth the risk. Long-horizon investors feel this most, because they lock in the comparison for years."],
            ].map(([head, body], i) => (
              <li key={head} className="flex gap-3">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                <span><strong className="text-white">{head}</strong> {body}</span>
              </li>
            ))}
          </ol>

          <h2 className="text-2xl font-bold text-white mt-10">Try the criteria yourself</h2>
          <p>
            Every &ldquo;what a screen looks for&rdquo; line above can be tested on the{" "}
            <Link href="/tools/stock-screener" className="text-blue-400 hover:text-blue-300">FinancePlots stock screener</Link>{" "}
            against the S&amp;P 500, Nasdaq-100 or IBEX 35. It starts empty and suggests nothing: you choose each
            criterion and the matches come back in alphabetical order. Then ask the question this article is really
            about — how long would I hold it, and what would make me sell?
          </p>

          <p className="text-xs text-gray-500 border-t border-gray-800 pt-4">
            For education only. The screens described are simplified translations of each investor&apos;s published
            approach, not their actual holdings or recommendations. No security is named or recommended in this
            article, and nothing here is investment advice.
          </p>
        </div>

        <ShareButtons url={URL} title={TITLE} />

        <div className="mt-14 bg-[#0d1426] border border-blue-700/40 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Free Tools for Individuals</h3>
          <p className="text-gray-400 text-sm mb-6">
            Stock screener, portfolio analysis, compound interest and a step-by-step financial plan — no signup.
          </p>
          <Link
            href="/tools/personal"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition inline-block"
          >
            Open Tools for Individuals
          </Link>
        </div>

      </BlogArticleShell>
    </main>
  );
}
