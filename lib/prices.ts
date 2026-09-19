import { unstable_cache } from "next/cache";
import yahooFinance from "yahoo-finance2";
import type { PriceHistory, PricePoint, PriceRange } from "@/lib/price-types";

/**
 * Daily price history for one ticker from Yahoo Finance, with a 200-day moving
 * average and summary figures. Used by /api/prices (the Stock Analysis page) and
 * the MCP server's price_history tool. Raw prices only — nothing here scores,
 * ranks or signals anything.
 */

export { PRICE_RANGES, SYMBOL_PATTERN, normaliseSymbol, type PricePoint, type PriceHistory, type PriceRange } from "@/lib/price-types";

// Calendar days to show per range. Daily ranges fetch ~300 extra days so the
// 200-day average exists from the first point shown.
const RANGE_DAYS: Record<Exclude<PriceRange, "max">, number> = { "1m": 31, "6m": 183, "1y": 366, "5y": 1827 };
const MA_WARMUP_DAYS = 300;

// v3: default export is the YahooFinance class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YF = yahooFinance as any;
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

interface RawChart {
  meta?: { symbol?: string; longName?: string; shortName?: string; currency?: string; fullExchangeName?: string; exchangeName?: string };
  quotes?: { date: Date | string; close?: number | null }[];
}

export class UnknownSymbolError extends Error {
  name = "UnknownSymbolError";
}

/** Checked by name, not instanceof: the error crosses unstable_cache on its way out. */
export const isUnknownSymbol = (err: unknown) => err instanceof Error && err.name === "UnknownSymbolError";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

async function fetchHistory(symbol: string, range: PriceRange): Promise<PriceHistory> {
  const now = new Date();
  const daily = range !== "max";
  const period1 = daily
    ? new Date(now.getTime() - (RANGE_DAYS[range] + MA_WARMUP_DAYS) * 86_400_000)
    : new Date("1970-01-01");

  let raw: RawChart;
  try {
    raw = await yf.chart(symbol, { period1, interval: daily ? "1d" : "1wk" }, { validateResult: false });
  } catch (err) {
    // Yahoo answers an unknown ticker with a 404 / "No data found"
    if (/not found|no data|404/i.test(String(err))) throw new UnknownSymbolError(symbol);
    throw err;
  }

  const closes = (raw.quotes ?? [])
    .filter((q) => typeof q.close === "number" && Number.isFinite(q.close))
    .map((q) => ({ date: iso(new Date(q.date)), close: q.close as number }));
  if (closes.length === 0) throw new UnknownSymbolError(symbol);

  const all: PricePoint[] = closes.map((c, i) => {
    let ma200: number | null = null;
    if (daily && i >= 199) {
      let sum = 0;
      for (let j = i - 199; j <= i; j++) sum += closes[j].close;
      ma200 = round(sum / 200, 4);
    }
    return { date: c.date, close: round(c.close, 4), ma200 };
  });

  const from = daily ? iso(new Date(now.getTime() - RANGE_DAYS[range] * 86_400_000)) : "";
  const points = all.filter((p) => p.date >= from);
  if (points.length === 0) throw new UnknownSymbolError(symbol);

  const first = points[0];
  const last = points[points.length - 1];
  let high = first;
  let low = first;
  for (const p of points) {
    if (p.close > high.close) high = p;
    if (p.close < low.close) low = p;
  }

  let volatility: number | null = null;
  if (daily && points.length > 20) {
    const rets = points.slice(1).map((p, i) => Math.log(p.close / points[i].close));
    const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
    const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / (rets.length - 1);
    volatility = round(Math.sqrt(variance * 252) * 100, 1);
  }

  const meta = raw.meta ?? {};
  return {
    symbol: meta.symbol ?? symbol,
    name: meta.longName ?? meta.shortName ?? symbol,
    currency: meta.currency ?? "",
    exchange: meta.fullExchangeName ?? meta.exchangeName ?? "",
    range,
    interval: daily ? "1d" : "1wk",
    points,
    stats: {
      last_close: last.close,
      last_date: last.date,
      first_close: first.close,
      first_date: first.date,
      change_pct: round((last.close / first.close - 1) * 100),
      high: { close: high.close, date: high.date },
      low: { close: low.close, date: low.date },
      vs_ma200_pct: last.ma200 ? round((last.close / last.ma200 - 1) * 100) : null,
      volatility_pct: volatility,
    },
  };
}

// yahoo-finance2 doesn't go through Next's fetch cache (see lib/markets.ts).
// Daily closes only change once a day; 15 minutes keeps the last price fresh enough.
export const getPriceHistory = unstable_cache(fetchHistory, ["price-history-v1"], { revalidate: 900 });

/** Evenly thins a series to at most `max` points, always keeping the last one. */
export function thin<T>(points: T[], max: number): T[] {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}
