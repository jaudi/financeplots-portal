# FinancePlots Portal

Next.js portal serving https://www.financeplots.com — free finance and FP&A tools.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- next-intl for i18n (`en` / `es`) — every page lives under `app/[locale]/`
- Tailwind v4
- Hosted on Vercel, auto-deploys on push to `master`

## Layout

- `app/[locale]/tools/*` — 20 native tool routes (calculators, screeners, dashboards). No iframes; the old Streamlit embed is gone.
- `app/api/*` — server routes for data the client can't fetch directly (API keys, CORS)
- `lib/` — shared server-side data access (`fred.ts`, `screener.ts`)
- `messages/en.json`, `messages/es.json` — all UI copy, including the `/tools` grid entries
- `app/sitemap.ts` — tool slugs are listed in one array and expanded per locale

Adding a tool means: a route under `app/[locale]/tools/`, an entry in both message files, and its slug in `app/sitemap.ts`. Missing the third is easy to do and makes the page invisible to crawlers.

## Data sources

- **FRED** — `lib/fred.ts` fetches 8 US macro series server-side; needs `FRED_API_KEY`
- **Screener reports** — fetched live from `raw.githubusercontent.com`; the `sp500-quality-screener` repo runs weekly in GitHub Actions and commits its JSON. No database anywhere. Three reports: S&P 500, IBEX 35, Nasdaq-100.
- **Yahoo Finance** — `yahoo-finance2` for stock/portfolio tools

## The screeners

`components/ScreenerReport.tsx` renders all three, driven by a `variant` prop:

- `variant="quality"` (default) — S&P 500 and IBEX 35. Columns: P/E, ROE, ROA, D/E, RSI, price, MA50.
- `variant="growth"` — Nasdaq-100. Columns: score, revenue growth, earnings growth, FCF, RSI, 6M/12M returns, price, MA50, MA200.

The two screens ask different questions, so they report different columns. That
is why the table is driven by a column descriptor rather than hardcoded `<td>`s,
and why a company row is `Record<string, string | number | null>` rather than one
fixed interface. Descriptors are plain data — no render functions — because they
cross the server → client boundary.

Things to know:

- **The Nasdaq-100 screen has no P/E, ROE or leverage filter, on purpose.** A P/E
  < 20 filter rejects almost the entire index and what it lets through is the
  least representative of it. If you find yourself "fixing" that omission, read
  `criteria.excluded_on_purpose` in the JSON first.
- **`score` is a within-cohort percentile rank, not a grade.** The page prints
  the pipeline's own explanation of it from `criteria.score` rather than a copy,
  so the two can't drift.
- **The methodology note under the growth table comes from the JSON**, not from
  the component. Change the filters in the pipeline and the page follows.
- Adding a screener means a route, an API route under `app/api/`, a fetcher in
  `lib/screener.ts`, and the usual three (message files, sitemap, `RelatedTools`)
  — plus the `Navbar` `SCREENERS` list and the `ScreenerSpotlight` card on the
  homepage, which the other tools don't have.

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
