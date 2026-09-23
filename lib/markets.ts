import { unstable_cache } from "next/cache";
import yahooFinance from "yahoo-finance2";

/**
 * Headline market quotes from Yahoo Finance: indices, FX, commodities, crypto
 * and rates. Used by /api/markets and the MCP server's market_snapshot tool.
 */

interface RawQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
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
  "^VIX":     { label: "VIX",       group: "Rates" },
};

function mapQuote(q: RawQuote): MarketQuote {
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
export const getMarketQuotes = unstable_cache(fetchQuotes, ["market-quotes-v1"], { revalidate: 60 });
