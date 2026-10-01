# FinancePlots Portal

Next.js portal serving https://www.financeplots.com — free finance and FP&A tools.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- next-intl for i18n (`en` / `es`) — every page lives under `app/[locale]/`
- Tailwind v4
- Hosted on Vercel, auto-deploys on push to `master`
- `package.json` `overrides` pins `@swc/core` (pulled in by next-intl's config plugin) to 1.15.21: 1.16.12, published 2026-09-29, validates the permissions of its native-binding cache folder and refused to load, so `next build` failed at `next.config.ts`. Try removing the pin when a later 1.16.x is out, and run `npm run build` before pushing.

## Layout

- `app/[locale]/tools/*` — 17 native tool routes (calculators, a stock screener, dashboards). The last three Streamlit iframes (`stock-analysis`, `stock-comparison`, `portfolio-analysis`) were rebuilt natively on 2026-09-19 on `/api/prices`: `components/StockAnalysis.tsx`, `StockComparison.tsx` (maths in `lib/price-stats.ts`) and `PortfolioAnalysis.tsx` (maths in `lib/portfolio-stats.ts`, shared with the MCP). `/dashboard`, the old Streamlit iframe route, was deleted the same day and 308s to `/tools` (`next.config.ts`). Nothing on the site uses the Railway app any more.
- **Tools are split by audience** (2026-09-29, from reader feedback: individuals and companies are different audiences). `lib/audiences.ts` assigns each tool to `personal` and/or `business`; each has its own hub (`/tools/personal`, `/tools/business` via `components/AudienceHub.tsx`) and its own navbar menu, and `/tools` and the homepage show one door per audience (`components/AudienceDoors.tsx`). Tool names and descriptions live once in `tools.catalog` in the message files; audience copy in `audiences`. Each tool's "←" back link goes to its hub, not `/tools`. A new tool needs its slug in `lib/audiences.ts` and a `tools.catalog` entry, or it appears in no menu.
- `app/api/*` — server routes for data the client can't fetch directly (API keys, CORS)
- `lib/` — shared server-side data access (`fred.ts`, `universe.ts`, `markets.ts`, `prices.ts`; `price-types.ts` holds the parts the browser also needs), `stock-metrics.ts` (the stock screener's metric definitions), `calculators.ts` (calculator maths shared by the pages and the MCP server) and `mcp-server.ts`
- `messages/en.json`, `messages/es.json` — all UI copy, including the `/tools` grid entries
- `app/sitemap.ts` — tool slugs are listed in one array and expanded per locale

Adding a tool means: a route under `app/[locale]/tools/`, an entry in both message files, and its slug in `app/sitemap.ts`. Missing the third is easy to do and makes the page invisible to crawlers.

## Data sources

- **FRED** — `lib/fred.ts` fetches 9 US macro series server-side; needs `FRED_API_KEY`
- **Stock screener data** — `lib/universe.ts` fetches `universe-*.json` live from `raw.githubusercontent.com`; the `sp500-quality-screener` repo refreshes it weekly in GitHub Actions. No database anywhere. Three indices: S&P 500, IBEX 35, Nasdaq-100.
- **Yahoo Finance** — `yahoo-finance2` for quotes (`lib/markets.ts`) and price history (`lib/prices.ts`). Its calls bypass Next's fetch cache, so each is wrapped in `unstable_cache`. Stock Analysis, Stock Comparison and Portfolio Analysis follow the screener's neutrality: they open empty, never suggest a ticker or holding, show moves with ▲/▼ rather than green/red, keep tickers in the order typed with colours by position (never by performance), and grade nothing (no "good" Sharpe ratio).
- **Stocks area** (phase 0 of a plan to merge the stock tools, 2026-10-01): `/tools/stocks` is the front door (`components/StocksHub.tsx`, one search box), and `components/StocksNav.tsx` is a tab bar on Stock Analysis, Stock Comparison, Portfolio Analysis and the screener. The four keep their own URLs (shared links, blog posts and the MCP's `tool_page` point at them); switching tab carries the tickers on screen across, read from each tool's URL (`?symbol=` / `?symbols=` / `?h=`), equal weights for the portfolio. The Individuals menu lists only `stocks` and `market-indices` for investing. Screener tickers link to their price history. **Company pages** (phase 1): `/tools/stocks/[ticker]` (`lib/company.ts`): the live price chart (`StockAnalysis` with `fixed`) plus the ratios from the weekly screener snapshot — Valuation, Profitability, Debt, Growth — each with a plain-English sentence and its own position bar within the first index the company belongs to (S&P 500, then Nasdaq-100, then IBEX 35). **Never the snapshot's price-based measures** (price, returns, 200-day distance, RSI): they'd be a week stale next to the live chart. No group or total score, no verdict words; `tests/company.test.ts` pins this. Tickers outside the three indices get the chart and a note. `noindex` and not in the sitemap until phase 3 adds history (thin-content risk). `proxy.ts` matches `/tools/stocks/:ticker` explicitly because its main pattern skips paths with a dot (SAN.MC). Screener tickers and the hub's single-ticker search open company pages. **Compare mode and My list** (phase 2): `?vs=MSFT,SAN.MC` (up to `MAX_VS` = 3, in `lib/stock-metrics.ts` because a server page importing a constant from a `"use client"` file gets a client reference, not the value) adds a side-by-side ratio table: order as typed, each figure positioned within its own company's index, no cell highlighted, nothing totalled. "My list" (`components/MyList.tsx`) is up to 8 tickers in `localStorage`, added only by the visitor (＋ My list on company pages and screener results), shown on the hub with Compare figures / Compare prices / Analyse as a portfolio. Next phases: SEC EDGAR history, an MCP `company_profile` — each with no verdicts, scores or rankings (UK MAR).
- **Company-name search** in those three tools (`components/TickerSearch.tsx` → `/api/symbols` → `lib/symbol-search.ts`, 2026-09-29): our index lists first, Yahoo Finance search only when they give fewer than 3 matches. Nothing is suggested before two characters are typed, and results are ordered by how well they match the text, then our lists ahead of Yahoo's, then alphabetically — never by popularity or Yahoo's own order. `LOCAL_FIXES` holds brand names people search by (Inditex, Google) and names the pipeline gets wrong. Yahoo's search payload fails the library's schema check, so it runs with `validateResult: false` and reads four fields defensively.

## The stock screener (and why there is only one)

**The site does not publish curated lists of named securities** (UK MAR
investment-recommendation rules, 2026-09-14). That removed the homepage ticker
strip, the three index screener pages (top-N tables, monthly AI commentary,
reverse-DCF table, track record) and the old score-ranked stock screener. Their
URLs 301 to `/tools/stock-screener?index=…` (`next.config.ts`). Don't bring any
of it back without legal sign-off.

`/tools/stock-screener` (`components/StockScreener.tsx`) is neutral by
construction. Keep these properties when you change it:

- **Nothing renders until the user runs a screen** with at least one criterion.
  No default, featured or "popular" list, and no suggested threshold values.
- `?measures=pe,price_to_book,…` (keys or English aliases, `parseMetricList`)
  only **highlights** measures — used by the investor cards in the
  `famous-investor-playbooks` post. It must never fill in a limit, and the
  screener itself shows no investor names: the educational context stays in
  the article (decided 2026-09-29).
- **Results are alphabetical by ticker**, and the user can sort by any column
  they filtered on. No site score, percentile, rank or recommendation wording,
  and no green/red colouring that reads as good or bad.
- **Only raw metrics reach the browser.** `lib/universe.ts` allowlists the
  fields in `METRIC_KEYS` (`lib/stock-metrics.ts`) and re-sorts by ticker. The
  pipeline's own `score`, factor percentiles, `beneficio_en_pico` and
  reverse-DCF output are also stripped by a workflow step before the JSON is
  committed. A new pipeline field stays off the site until someone adds it to
  the allowlist on purpose.
- A company with no figure for a filtered metric is left out and counted, not
  silently treated as passing or failing.
- **The snowflakes (`components/NeutralSnowflake.tsx`) are positions, not
  grades.** Axes are only the measures the user filtered on (three or more).
  Each point is the share of the index with a lower figure — further out means
  *higher*, never *better*, so the site never inverts an axis for P/E or debt.
  The visitor can reverse an axis themselves ("Further out means: lower"),
  nothing is reversed until they click, and a reversed axis is labelled. One
  neutral colour, no total or area score. The old `FactorSnowflake` broke all
  three rules (site weights, "better" pointing out, green/amber/red) and was
  removed for it.

Units follow the pipeline: `%` metrics are percentage points (`roe: 16.5` is
16.5%), `deuda_patrimonio` is a percentage, and prices are in the listing
currency. The growth metrics compare the latest year with the average of the
prior reported years — they are not year-on-year.

## MCP server

`/api/mcp` is a public, unauthenticated remote MCP server (Streamable HTTP, stateless, JSON responses) built on `@modelcontextprotocol/sdk`. Tools are defined in `lib/mcp-server.ts`: `take_home_pay`, `loan_repayment`, `compound_interest`, `break_even`, `industry_multiples`, `business_valuation`, `startup_valuation`, `us_macro_indicators`, `market_snapshot`, `price_history`, `portfolio_analysis`, `screener_metrics`, `screen_stocks`.

- The calculators call the same functions as the tool pages (`lib/calculators.ts`), so the MCP and the site can't give different answers for the same inputs. Change the formula there, not in a page.
- `screen_stocks` follows the stock screener's neutrality rules above: at least one criterion, alphabetical by ticker, raw figures only. Don't add a tool that returns a default, ranked or curated list of securities. `limit` (default 50) cuts the A–Z list and sets `truncated`; it never reorders. Metrics can be named by the data's key or an English alias (`METRIC_ALIASES` in `lib/stock-metrics.ts`); the response echoes the name the caller used.
- Companies the pipeline gives no sector ("N/A" or blank) get the sector "Unclassified" in `lib/universe.ts`, on the page too, so they stay findable.
- `take_home_pay` and `/tools/take-home-pay` share `takeHomePay()` / `grossForTakeHome()` in `lib/calculators.ts`: UK PAYE on the standard code, England/Wales/NI or Scotland, NI, Plans 1/2/4/5 and postgraduate loans, three pension methods. **The rates are per tax year** (`TAX_YEAR`, currently 2026/27 from GOV.UK "Rates and thresholds for employers"): update every constant together each April and re-check `tests/take-home-pay.test.ts`, whose figures are worked by hand from those rates. The page's "Plan your budget" link passes the monthly take-home to `/tools/personal-budget?salary=`.
- `INDUSTRIES` in `lib/calculators.ts` is Damodaran data (January 2026): the valuation page uses the multiples, `startup_valuation` (its Damodaran DCF) the margin, sales-to-capital and cost of capital. Damodaran republishes every January — refresh all six columns together.
- **Backwards compatibility:** clients depend on the response shape. Add fields and input aliases; never remove or rename one — mark it deprecated in the description instead (e.g. `var95_pct`, kept next to `var95_daily_pct`).
- `business_valuation` never averages a meaningless number: a method whose driver (FCF, EBITDA, net income, revenue) is ≤ 0 is `null`, listed in `excluded_methods` and left out of the average (in the shared `valuation()`, so the page shows "n/a" too); EBITDA, net income and FCF all ≤ 0 is rejected with a pointer to `startup_valuation`. Private-company discounts, in both valuation tools, come off enterprise value only — never off cash.
- **Charts.** Eight tools (take-home pay, loan, compound interest, break-even, both valuations, price history, portfolio) return charts two ways from one `ChartSpec` (`lib/charts/tool-charts.ts`): PNG images after the JSON, for any client, and — for hosts with MCP Apps (Claude, ChatGPT) — an interactive view at `ui://financeplots/charts.html` that reads the specs from the result's `_meta["financeplots/charts"]`. Both draw the same layout (`lib/charts/layout.ts`, pure TS). The PNG puts text through Satori because SVG text renders without a font in `next/og`. `chart: false` skips both. Colours follow series position, never good/bad.
- **The view is generated.** `mcp-app/chart-view.ts` is bundled by `scripts/build-mcp-app.mjs` (esbuild) into `lib/mcp-app/chart-view-html.generated.ts`, gitignored and rebuilt by the `predev`/`prebuild`/`pretest` scripts — a fresh clone needs one of them (or `npm run build:mcp-app`) before `tsc`. It is one inline page, no network, so hosts need no CSP allowance; ~520 KB, nearly all zod from the official `@modelcontextprotocol/ext-apps` (kept for protocol correctness). ext-apps 2.x needs SDK v2 — stay on 1.x while the portal uses `@modelcontextprotocol/sdk` 1.x.
- No tool calls the Claude API — a public endpoint that spends `ANTHROPIC_API_KEY` per call would be an open bill. Yahoo quotes are cached 60 s (`lib/markets.ts`), FRED 24 h.

`/mcp` (`app/[locale]/mcp/page.tsx`, copy in the `mcp` message namespace) tells people how to connect it. Its tool list is written by hand — update it when a tool is added or removed.

`npm test` (Vitest, `tests/`) calls every tool through the real server in-process (`tests/mcp-client.ts`). Data tools run on mocks or the committed screener snapshot, never the network. The valuation tests pin figures checked by hand in the September 2026 external review — if one moves, the maths changed.

Test by hand with `npx @modelcontextprotocol/inspector` pointed at `http://localhost:3000/api/mcp`.

## AI

`app/api/macro/report/route.ts` calls the Claude API (`claude-sonnet-5`) to write the ~400-word commentary on `/tools/macro-dashboard`. Needs `ANTHROPIC_API_KEY`.

Two things to know before changing it:

- **`unstable_cache` keys on the indicator values, not on the prompt or the model.** Change either and you must bump the key (`macro-report-vN`), or the old text stays cached until FRED next publishes and your change looks like it did nothing.
- **Route-level `export const revalidate` does not stop the handler re-executing.** Route handlers are dynamic (`ƒ` in the build output); only the inner `fetch` calls are cached. Anything expensive and non-`fetch` — an LLM call — needs its own cache wrapper or it runs on every request.

Length instructions to the model work better as a per-paragraph budget than a total word count.

## Env vars

Set in the Vercel dashboard, **Production scope included** — a variable scoped only to Preview will not reach the live site, and a variable only binds to builds created after it was saved.

- `FRED_API_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY` — contact form (`/api/subscribe`)
- `SCREENER_REPO_TOKEN` — fine-grained GitHub token, read-only **Contents** on `jaudi/sp500-quality-screener` only. That repo is private. Without this, `lib/universe.ts` serves the snapshot committed in `data/universe/` (copied 2026-09-14 with the owner's approval — raw metrics only, no scores) — the screener keeps working, but its numbers are frozen at that date. Refresh the snapshot by copying the data repo's `data/universe-*.json` there.
