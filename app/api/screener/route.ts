import { NextResponse } from "next/server";

const REPORT_URL =
  "https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/data/latest-report.json";

export const revalidate = 604800; // 7 days, matches the pipeline's weekly schedule

interface Company {
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

interface ScreenerReport {
  generated_at: string | null;
  universe_size: number;
  analyzed: number;
  passed_filters: number;
  companies: Company[];
  failed: { ticker: string; error: string }[];
  report: string | null;
}

export async function GET() {
  try {
    const res = await fetch(REPORT_URL, { next: { revalidate: 604800 } });
    if (!res.ok) throw new Error(`Report fetch failed: ${res.status}`);
    const json: ScreenerReport = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    console.error("Screener API error:", err);
    return NextResponse.json({ error: "Report unavailable" }, { status: 503 });
  }
}
