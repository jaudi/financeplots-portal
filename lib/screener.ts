/** A row from the quality screen (S&P 500, IBEX 35). Percentages arrive
 *  pre-formatted as strings; the P/E arrives as a number. */
export interface ScreenerCompany {
  ticker: string;
  nombre: string;
  sector: string;
  per: number;
  roe: string;
  roa: string;
  deuda_patrimonio: string;
  rsi: number;
  precio_actual: number;
  ma50: number;
}

/** A row from the growth screen (Nasdaq-100). Deliberately shares no valuation
 *  or profitability column with ScreenerCompany — the two screens ask different
 *  questions, so they report different things. Percentages are numbers here, not
 *  pre-formatted strings, because the table sorts and colours on them. */
export interface GrowthCompany {
  ticker: string;
  nombre: string;
  sector: string;
  /** Year-on-year, most recent reported period. */
  crecimiento_ingresos: number;
  crecimiento_beneficios: number;
  /** Carried for context, not filtered on. Null when Yahoo doesn't report it. */
  margen_bruto: number | null;
  /** Trailing free cash flow, in millions of the reporting currency. */
  flujo_caja_libre: number;
  rsi: number;
  precio_actual: number;
  ma50: number;
  ma200: number;
  /** Total returns in percent, on split- and dividend-adjusted prices. */
  retorno_6m: number;
  retorno_12m: number;
  /** Within-cohort percentile rank over revenue growth, earnings growth and the
   *  6-month return. 100 is the best of the names that passed *this week* — it
   *  moves when the cohort moves, and it is not a quality grade. */
  score: number;
}

/** The growth screen's filter set, carried in the JSON so the page and the
 *  pipeline can't drift apart on what was actually applied. */
export interface GrowthCriteria {
  screen: string;
  revenue_growth_min_pct: number;
  earnings_growth_min_pct: number;
  free_cash_flow: string;
  trend: string;
  return_6m: string;
  rsi_min: number;
  excluded_on_purpose: string;
  score: string;
}

/** P(growth >= implied growth), fitted to the company's own year-on-year FCF
 *  growth in log space. `observations` is typically 3 — yfinance only exposes
 *  4-5 annual statements — so `historical_log_stdev` is what says whether the
 *  number is worth quoting: under ~0.2 the company compounds steadily, over
 *  ~1.0 it is barely better than a coin flip. */
export interface ValuationProbability {
  observations: number;
  historical_mean_growth_pct: number | null;
  basis?: string;
  historical_log_stdev?: number;
  t_statistic?: number;
  degrees_of_freedom?: number;
  probability_pct: number | null;
  /** [low, high] band implied by the ~3-observation sample. Quote this, not the
   *  point estimate. */
  probability_range_pct?: number[] | null;
  /** Present when the estimate was withheld — volatility too high, or too few
   *  usable observations. A null probability is a finding, not missing data. */
  reason?: string;
}

export interface ScreenerValuation {
  ticker: string;
  nombre: string | null;
  sector: string | null;
  market_cap: number;
  currency: string | null;
  price: number | null;
  /** The actual most recent year. The DCF uses fcf_base_normalised, not this. */
  fcf_latest: number;
  fcf_source: string;
  fcf_years: number;
  fcf_series: number[];
  cost_of_equity_pct: number;
  beta_used: number;
  beta_reported?: number | null;
  beta_clamped?: boolean;
  ke_clamped?: boolean;
  beta_missing?: boolean;
  risk_free_rate_pct: number;
  /** Whether the risk-free rate was a live quote or a static per-currency
   *  assumption — only USD has a live source. */
  risk_free_source?: string;
  /** Reverse DCF: the growth the current price implies. Not a forecast. The one
   *  figure available for every company, since it needs no history. */
  implied_growth_pct: number | null;
  implied_growth_status: string;
  /** Endpoint-to-endpoint CAGR. Sees only the first and last year. */
  historical_growth_pct: number | null;
  /** Least-squares slope through log FCF, using every point. */
  trend_growth_pct?: number | null;
  /** Whether the cash flows behave like a trend at all. Below 0.5 nothing is
   *  projected — this is the single most important diagnostic in the row. */
  trend_r2?: number | null;
  /** The same fit over just the last few years. Where it diverges from the
   *  long-run trend, the projection takes whichever is lower. */
  trend_recent_pct?: number | null;
  trend_broken?: boolean;
  fcf_base_normalised?: number | null;
  revenue_growth_pct?: number | null;
  fcf_vs_revenue_divergence_pp?: number | null;
  modelled_growth_pct: number | null;
  historical_growth_capped: boolean;
  /** Null whenever the trend failed the R² test — a gap against a discarded
   *  trend is arithmetic, not evidence. */
  gap_pp: number | null;
  dcf_value_per_share: number | null;
  dcf_upside_pct: number | null;
  /** How much of the DCF comes from the 2.5% perpetuity rather than the ten
   *  explicit years. High means that one assumption is doing the work. */
  dcf_terminal_value_share_pct?: number | null;
  /** Why no projection was made. Present exactly when dcf_value_per_share is null. */
  dcf_skipped_reason?: string | null;
  probability: ValuationProbability;
}

export interface ValuationMethod {
  model: string;
  horizon_years: number;
  terminal_growth_pct: number;
  discount_rate: string;
  implied_growth: string;
  trend_test?: string;
  projected_growth_band_pct: number[];
  probability: string;
  known_limits?: string[];
}

export interface ScreenerReportData {
  generated_at: string | null;
  universe_size: number;
  analyzed: number;
  passed_filters: number;
  companies: ScreenerCompany[];
  failed: { ticker: string; error: string }[];
  report: string | null;
  // Added by the reverse-DCF stage. Optional because a report written before
  // that stage shipped, or a run where it threw, simply has no valuation block.
  valuation_method?: ValuationMethod;
  valuations?: ScreenerValuation[];
  valuation_failed?: { ticker: string; error: string }[];
  valuation_report?: string | null;
}

const SP500_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report.json";
const IBEX35_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report-ibex35.json";
const NASDAQ100_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report-nasdaq100.json";

// 1 hour. The pipeline only writes a new report weekly, but matching the cache to
// that 7-day cadence meant a fresh report could sit unseen for days until someone
// pushed a redeploy — the two schedules never line up. Revalidating hourly picks up
// each run on its own, and costs one cheap refetch of a static file from GitHub.
export const SCREENER_REVALIDATE_SECONDS = 3600;

async function fetchReport<T>(url: string): Promise<T | null> {
  // Vercel's Data Cache survives redeploys, so an entry written under the old 7-day
  // window would keep being served even from a fresh deployment — a new report could
  // stay invisible for days with no way to force it short of purging the cache by hand.
  // Bucketing the URL by the hour gives each hour its own cache key, so a new report
  // always surfaces within the hour regardless of what is already cached. GitHub
  // ignores the extra param when serving raw files.
  const hourBucket = Math.floor(Date.now() / (SCREENER_REVALIDATE_SECONDS * 1000));

  try {
    const res = await fetch(`${url}?h=${hourBucket}`, {
      next: { revalidate: SCREENER_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getSp500Report(): Promise<ScreenerReportData | null> {
  return fetchReport<ScreenerReportData>(SP500_REPORT_URL);
}

export function getIbex35Report(): Promise<ScreenerReportData | null> {
  return fetchReport<ScreenerReportData>(IBEX35_REPORT_URL);
}

/** The growth report. Same envelope as ScreenerReportData — including the whole
 *  reverse-DCF block, which runs unchanged on whichever names passed — with a
 *  different company shape and the filter set carried alongside. */
export interface GrowthReportData {
  generated_at: string | null;
  universe_size: number;
  /** Whether the constituent list came from the live scrape or the pinned
   *  fallback. Surfaced on the page: a stale universe is otherwise invisible. */
  universe_source?: string | null;
  analyzed: number;
  passed_filters: number;
  companies: GrowthCompany[];
  failed: { ticker: string; error: string }[];
  report: string | null;
  criteria?: GrowthCriteria;
  valuation_method?: ValuationMethod;
  valuations?: ScreenerValuation[];
  valuation_failed?: { ticker: string; error: string }[];
  valuation_report?: string | null;
}

export function getNasdaq100Report(): Promise<GrowthReportData | null> {
  return fetchReport<GrowthReportData>(NASDAQ100_REPORT_URL);
}
