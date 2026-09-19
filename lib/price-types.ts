// Shared by lib/prices.ts (server) and components/StockAnalysis.tsx (browser),
// so it must not import anything server-only.

export const PRICE_RANGES = ["1m", "6m", "1y", "5y", "max"] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
  /** 200-trading-day average; null until 200 closes are available, and on the weekly "max" range */
  ma200: number | null;
}

export interface PriceHistory {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  range: PriceRange;
  interval: "1d" | "1wk";
  points: PricePoint[];
  stats: {
    last_close: number;
    last_date: string;
    first_close: number;
    first_date: string;
    change_pct: number;
    high: { close: number; date: string };
    low: { close: number; date: string };
    /** Last close vs its 200-day average, percent; null when there's no average */
    vs_ma200_pct: number | null;
    /** Annualised standard deviation of daily returns, percent (daily ranges only) */
    volatility_pct: number | null;
  };
}

/** Tickers are letters, digits and . - ^ = (e.g. AAPL, SAN.MC, BRK-B, ^GSPC, EURUSD=X). */
export const SYMBOL_PATTERN = /^[A-Z0-9.\-^=]{1,15}$/;

export function normaliseSymbol(raw: string): string | null {
  const s = raw.trim().toUpperCase();
  return SYMBOL_PATTERN.test(s) ? s : null;
}
