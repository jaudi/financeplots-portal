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
  reason?: string;
}

export interface ScreenerValuation {
  ticker: string;
  nombre: string | null;
  sector: string | null;
  market_cap: number;
  currency: string | null;
  price: number | null;
  fcf_latest: number;
  fcf_source: string;
  fcf_years: number;
  fcf_series: number[];
  cost_of_equity_pct: number;
  beta_used: number;
  risk_free_rate_pct: number;
  /** Reverse DCF: the growth the current price implies. Not a forecast. */
  implied_growth_pct: number | null;
  implied_growth_status: string;
  historical_growth_pct: number | null;
  /** What the forward DCF actually projected — clamped to [-15%, +25%]. */
  modelled_growth_pct: number | null;
  historical_growth_capped: boolean;
  gap_pp: number | null;
  dcf_value_per_share: number | null;
  dcf_upside_pct: number | null;
  probability: ValuationProbability;
}

export interface ValuationMethod {
  model: string;
  horizon_years: number;
  terminal_growth_pct: number;
  discount_rate: string;
  implied_growth: string;
  projected_growth_band_pct: number[];
  probability: string;
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
const FUNDS_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report-funds.json";

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

export interface FundMethodology {
  data_source: string;
  vehicle: string;
  domicile: string[];
  domicile_note: string;
  max_ter_ocf_pct: number;
  asset_class: string;
  listing_preference: string;
  sharpe_calc: string;
  sanity_filter: string;
}

export interface Fund {
  isin: string;
  ticker: string;
  listado_lse: boolean;
  nombre: string;
  domicilio: string;
  ter: number;
  rendimiento_3y: number;
  volatilidad_3y: number;
  sharpe: number;
}

export interface FundsReportData {
  generated_at: string | null;
  methodology: FundMethodology;
  universe_size: number;
  passed_filters: number;
  funds: Fund[];
  failed_count: number;
  report: string | null;
  error?: string;
}

export function getFundsReport(): Promise<FundsReportData | null> {
  return fetchReport<FundsReportData>(FUNDS_REPORT_URL);
}
