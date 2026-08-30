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

export interface ScreenerReportData {
  generated_at: string | null;
  universe_size: number;
  analyzed: number;
  passed_filters: number;
  companies: ScreenerCompany[];
  failed: { ticker: string; error: string }[];
  report: string | null;
}

const SP500_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report.json";
const IBEX35_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report-ibex35.json";
const FUNDS_REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report-funds.json";

export const SCREENER_REVALIDATE_SECONDS = 604800; // 7 days, matches the pipeline's weekly schedule

async function fetchReport<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: SCREENER_REVALIDATE_SECONDS } });
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
