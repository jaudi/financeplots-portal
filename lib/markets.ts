import { unstable_cache } from "next/cache";
import yahooFinance from "yahoo-finance2";

/**
 * Headline market quotes from Yahoo Finance: indices, FX, commodities, crypto
 * and rates. Used by /api/markets and the MCP server's market_snapshot tool.
 */

export interface RawQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: Date | string | number;
  currency?: string;
}

export interface MarketQuote {
  symbol: string;
  label: string;
  group: string;
  prefix: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
  /** When the price was quoted, ISO 8601 UTC; null if Yahoo doesn't say */
  time: string | null;
}

const SYMBOLS: Record<string, { label: string; group: string; prefix?: string }> = {
  "^GSPC":    { label: "S&P 500",   group: "Indices" },
  "^IXIC":    { label: "NASDAQ",    group: "Indices" },
  "^DJI":     { label: "Dow Jones", group: "Indices" },
  "^FTSE":    { label: "FTSE 100",  group: "Indices" },
  "^GDAXI":   { label: "DAX",       group: "Indices" },
  "EURUSD=X": { label: "EUR/USD",   group: "FX" },
  "GBPUSD=X": { label: "GBP/USD",   group: "FX" },
  "USDJPY=X": { label: "USD/JPY",   group: "FX" },
  "GC=F":     { label: "Gold",      group: "Commodities", prefix: "$" },
  "CL=F":     { label: "WTI Oil",   group: "Commodities", prefix: "$" },
  "BTC-USD":  { label: "Bitcoin",   group: "Crypto",      prefix: "$" },
  "^TNX":     { label: "US 10Y",    group: "Rates",       prefix: "" },
  "^VIX":     { label: "VIX",       group: "Volatility" },
};

function quoteTime(t: RawQuote["regularMarketTime"]): string | null {
  if (t === undefined || t === null) return null;
  // Unvalidated results give seconds since the epoch rather than a Date
  const d = typeof t === "number" ? new Date(t < 1e12 ? t * 1000 : t) : new Date(t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function mapQuote(q: RawQuote): MarketQuote {
  const meta = SYMBOLS[q.symbol] ?? { label: q.symbol, group: "Other" };
  return {
    symbol: q.symbol,
    label: meta.label,
    group: meta.group,
    prefix: meta.prefix ?? "",
    price: q.regularMarketPrice ?? null,
    change: q.regularMarketChange ?? null,
    changePct: q.regularMarketChangePercent ?? null,
    currency: q.currency ?? "",
    time: quoteTime(q.regularMarketTime),
  };
}

// v3: default export is the YahooFinance class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YF = yahooFinance as any;
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

async function fetchQuotes(): Promise<MarketQuote[]> {
  const raw: RawQuote[] = await yf.quote(Object.keys(SYMBOLS), {}, { validateResult: false });
  return (Array.isArray(raw) ? raw : [raw]).map(mapQuote);
}

// yahoo-finance2's requests don't go through Next's fetch cache, and a route
// handler re-runs on every request, so without this every call hits Yahoo.
export const getMarketQuotes = unstable_cache(fetchQuotes, ["market-quotes-v2"], { revalidate: 60 });
