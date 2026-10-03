import { unstable_cache } from "next/cache";
import yahooFinance from "yahoo-finance2";
import { getUniverse, UNIVERSE_SCREENS, type UniverseScreen } from "@/lib/universe";
import { SYMBOL_PATTERN } from "@/lib/price-types";

/**
 * Find a ticker by company name (or by ticker) for the price tools' search
 * boxes. Looks in our own index lists first (S&P 500, Nasdaq-100, IBEX 35);
 * only when they give fewer than MIN_LOCAL matches does it ask Yahoo Finance,
 * which covers everything else (other exchanges, ETFs, funds, indices).
 *
 * Neutral like the rest of the stock tools: nothing is suggested until the
 * visitor has typed, and results are ordered only by how well they match the
 * text typed, then with our own index lists ahead of Yahoo's (coverage, not
 * popularity), then alphabetically. Never by popularity, Yahoo's own order
 * included.
 */

export interface SymbolMatch {
  symbol: string;
  name: string;
  exchange: string;
  /** Extra words to match on (brand names), never shown. */
  also?: string;
  /** From our own index lists rather than Yahoo. */
  local?: boolean;
}

// Names people search by that aren't in the legal name, and names the data
// gets wrong (the pipeline has no name for Inditex). Matching only — the order
// of results is unaffected.
const LOCAL_FIXES: Record<string, { name?: string; also?: string }> = {
  // Display names come from lib/company-names.ts; these keep the legal names
  // and brands findable too.
  "ITX.MC": { also: "Industria de Diseño Textil Zara" },
  "IAG.MC": { also: "International Consolidated Airlines Iberia British Airways" },
  "RED.MC": { also: "Red Eléctrica REE" },
  "LOG.MC": { also: "Compañía de Distribución Integral" },
  "ANE.MC": { also: "Corporación Acciona Energías Renovables" },
  "BBVA.MC": { also: "Banco Bilbao Vizcaya Argentaria" },
  "ACS.MC": { also: "Actividades de Construcción y Servicios" },
  "ROVI.MC": { also: "Laboratorios Farmacéuticos" },
  "SLR.MC": { also: "Solaria Energía y Medio Ambiente" },
  "TEF.MC": { also: "Movistar" },
  "MTS.MC": { also: "Arcelor" },
  GOOGL: { also: "Google" },
  GOOG: { also: "Google" },
  META: { also: "Facebook Instagram WhatsApp" },
  "BRK-B": { also: "Berkshire" },
};

const MAX_RESULTS = 8;
const MIN_LOCAL = 3;
const EXCHANGE: Record<UniverseScreen, string> = { sp500: "US", nasdaq100: "US", ibex35: "Madrid" };
const YAHOO_TYPES = new Set(["EQUITY", "ETF", "MUTUALFUND", "INDEX"]);

// v3: default export is the YahooFinance class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YF = yahooFinance as any;
const yf = new YF({ suppressNotices: ["yahooSurvey"] });

export const normaliseQuery = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

/** 0 = the ticker itself, 1 = starts the ticker or a word of the name, 2 = inside the name, 3 = no text match. */
export function matchRank(m: SymbolMatch, q: string): number {
  const symbol = m.symbol.toLowerCase();
  const bare = symbol.split(".")[0];
  const name = normaliseQuery(m.also ? `${m.name} ${m.also}` : m.name);
  if (symbol === q || bare === q) return 0;
  if (symbol.startsWith(q) || name.startsWith(q) || name.includes(` ${q}`)) return 1;
  if (name.includes(q)) return 2;
  return 3;
}

export function rankMatches(matches: SymbolMatch[], q: string): SymbolMatch[] {
  return matches
    .map((m) => ({ m, r: matchRank(m, q) }))
    .sort(
      (a, b) =>
        a.r - b.r ||
        Number(Boolean(b.m.local)) - Number(Boolean(a.m.local)) ||
        a.m.name.localeCompare(b.m.name) ||
        a.m.symbol.localeCompare(b.m.symbol),
    )
    .map(({ m }) => m);
}

async function localIndex(): Promise<SymbolMatch[]> {
  const seen = new Map<string, SymbolMatch>();
  for (const screen of UNIVERSE_SCREENS) {
    const data = await getUniverse(screen);
    for (const c of data?.companies ?? []) {
      if (seen.has(c.ticker)) continue;
      const fix = LOCAL_FIXES[c.ticker] ?? {};
      seen.set(c.ticker, { symbol: c.ticker, name: fix.name ?? c.nombre, exchange: EXCHANGE[screen], also: fix.also, local: true });
    }
  }
  return [...seen.values()];
}

interface RawQuote {
  symbol?: string;
  longname?: string;
  shortname?: string;
  quoteType?: string;
  exchDisp?: string;
  isYahooFinance?: boolean;
}

const yahooSearch = unstable_cache(
  async (q: string): Promise<SymbolMatch[]> => {
    // Yahoo's search payload drifts from the library's schema; only four fields are read here, each checked below.
    const res = (await yf.search(q, { quotesCount: 10, newsCount: 0, enableFuzzyQuery: false }, { validateResult: false })) as { quotes?: RawQuote[] };
    return (res.quotes ?? [])
      .filter((x) => x.isYahooFinance && x.symbol && YAHOO_TYPES.has(x.quoteType ?? "") && SYMBOL_PATTERN.test(x.symbol))
      .map((x) => ({ symbol: x.symbol!, name: x.longname || x.shortname || x.symbol!, exchange: x.exchDisp ?? "" }));
  },
  ["symbol-search-v2"],
  { revalidate: 86400 },
);

export async function searchSymbols(raw: string): Promise<SymbolMatch[]> {
  const q = normaliseQuery(raw);
  if (q.length < 2) return [];

  const local = (await localIndex()).filter((m) => matchRank(m, q) < 3);
  let all = local;
  if (local.length < MIN_LOCAL) {
    try {
      const remote = await yahooSearch(q);
      const known = new Set(local.map((m) => m.symbol));
      all = [...local, ...remote.filter((m) => !known.has(m.symbol))];
    } catch (err) {
      console.warn(`symbol search: Yahoo failed for "${q}" (${String(err)}); local results only`);
    }
  }
  return rankMatches(all, q)
    .slice(0, MAX_RESULTS)
    .map(({ symbol, name, exchange }) => ({ symbol, name, exchange }));
}
