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

export const SCREENER_REVALIDATE_SECONDS = 604800; // 7 days, matches the pipeline's weekly schedule

async function fetchScreenerReport(url: string): Promise<ScreenerReportData | null> {
  try {
    const res = await fetch(url, { next: { revalidate: SCREENER_REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    return (await res.json()) as ScreenerReportData;
  } catch {
    return null;
  }
}

export function getSp500Report(): Promise<ScreenerReportData | null> {
  return fetchScreenerReport(SP500_REPORT_URL);
}

export function getIbex35Report(): Promise<ScreenerReportData | null> {
  return fetchScreenerReport(IBEX35_REPORT_URL);
}
