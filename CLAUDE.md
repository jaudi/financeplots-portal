# FinancePlots Portal

Next.js portal serving https://www.financeplots.com — free finance and FP&A tools.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- next-intl for i18n (`en` / `es`) — every page lives under `app/[locale]/`
- Tailwind v4
- Hosted on Vercel, auto-deploys on push to `master`

## Layout

- `app/[locale]/tools/*` — 17 native tool routes (calculators, a stock screener, dashboards). No iframes; the old Streamlit embed is gone.
- `app/api/*` — server routes for data the client can't fetch directly (API keys, CORS)
- `lib/` — shared server-side data access (`fred.ts`, `universe.ts`, `markets.ts`), `stock-metrics.ts` (the stock screener's metric definitions), `calculators.ts` (calculator maths shared by the pages and the MCP server) and `mcp-server.ts`
- `messages/en.json`, `messages/es.json` — all UI copy, including the `/tools` grid entries
- `app/sitemap.ts` — tool slugs are listed in one array and expanded per locale

Adding a tool means: a route under `app/[locale]/tools/`, an entry in both message files, and its slug in `app/sitemap.ts`. Missing the third is easy to do and makes the page invisible to crawlers.

## Data sources

- **FRED** — `lib/fred.ts` fetches 8 US macro series server-side; needs `FRED_API_KEY`
- **Stock screener data** — `lib/universe.ts` fetches `universe-*.json` live from `raw.githubusercontent.com`; the `sp500-quality-screener` repo refreshes it weekly in GitHub Actions. No database anywhere. Three indices: S&P 500, IBEX 35, Nasdaq-100.
- **Yahoo Finance** — `yahoo-finance2` for stock/portfolio tools

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

`/api/mcp` is a public, unauthenticated remote MCP server (Streamable HTTP, stateless, JSON responses) built on `@modelcontextprotocol/sdk`. Tools are defined in `lib/mcp-server.ts`: `loan_repayment`, `compound_interest`, `break_even`, `industry_multiples`, `business_valuation`, `us_macro_indicators`, `market_snapshot`, `screener_metrics`, `screen_stocks`.

- The calculators call the same functions as the tool pages (`lib/calculators.ts`), so the MCP and the site can't give different answers for the same inputs. Change the formula there, not in a page.
- `screen_stocks` follows the stock screener's neutrality rules above: at least one criterion, alphabetical by ticker, raw figures only. Don't add a tool that returns a default, ranked or curated list of securities.
- No tool calls the Claude API — a public endpoint that spends `ANTHROPIC_API_KEY` per call would be an open bill. Yahoo quotes are cached 60 s (`lib/markets.ts`), FRED 24 h.

Test locally with `npx @modelcontextprotocol/inspector` pointed at `http://localhost:3000/api/mcp`.

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
