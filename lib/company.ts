import { METRIC_GROUPS, METRICS, positionIn, type MetricDef, type MetricGroup, type MetricKey } from "@/lib/stock-metrics";
import { getUniverse, UNIVERSE_SCREENS, type UniverseCompany, type UniverseData, type UniverseScreen } from "@/lib/universe";

// What the company page shows about one ticker: its reported figures, and for
// each one where it sits within its index — "higher than 72% of the S&P 500".
// Same neutrality rules as the stock screener (CLAUDE.md, UK MAR): positions
// are per measure, never combined into a group or total score, and "higher" is
// never "better".

const PRICE_GROUP: MetricGroup = "Price & trend";

export const INDEX_LABELS: Record<UniverseScreen, string> = {
  sp500: "S&P 500",
  nasdaq100: "Nasdaq-100",
  ftse100: "FTSE 100",
  ibex35: "IBEX 35",
};

export interface CompanyMeasure {
  metric: MetricDef;
  value: number | null;
  /** Share of the index with a lower figure, 0–100; null when the company has no figure. */
  position: number | null;
  /** Companies in the index with a figure for this measure. */
  peers: number;
}

export interface CompanyProfile {
  company: UniverseCompany;
  /** The index positions are measured against: the first of S&P 500, Nasdaq-100, FTSE 100, IBEX 35 it belongs to. */
  index: UniverseScreen;
  memberOf: UniverseScreen[];
  generatedAt: string | null;
  groups: { group: MetricGroup; measures: CompanyMeasure[] }[];
}

async function loadUniverses() {
  return (await Promise.all(UNIVERSE_SCREENS.map((s) => getUniverse(s)))).filter((u) => u !== null);
}

export async function getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
  return profileFrom(await loadUniverses(), ticker);
}

/** Several companies at once (compare mode), in the order given; null where we have no figures. */
export async function getCompanyProfiles(tickers: string[]): Promise<(CompanyProfile | null)[]> {
  const universes = await loadUniverses();
  return tickers.map((t) => profileFrom(universes, t));
}

function profileFrom(universes: UniverseData[], ticker: string): CompanyProfile | null {
  const memberOf = universes.filter((u) => u.companies.some((c) => c.ticker === ticker));
  if (memberOf.length === 0) return null;

  const home = memberOf[0];
  const company = home.companies.find((c) => c.ticker === ticker)!;

  // Ratios only. The universe is a weekly snapshot, so its price-based measures
  // (price, returns, 200-day distance, RSI) would be stale next to the live
  // chart on the same page — the chart covers price.
  const groups = METRIC_GROUPS.filter((group) => group !== PRICE_GROUP).map((group) => ({
    group,
    measures: METRICS.filter((m) => m.group === group).map((metric) => {
      const sorted = home.companies
        .map((c) => c[metric.key])
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b);
      const value = company[metric.key];
      return { metric, value, position: value === null ? null : positionIn(sorted, value), peers: sorted.length };
    }),
  }));

  return { company, index: home.screen, memberOf: memberOf.map((u) => u.screen), generatedAt: home.generated_at, groups };
}

// The plain-English line under each figure, on the company page and on the
// company map's card.

const n = (v: number, dp = 1) => Math.abs(v).toLocaleString("en-GB", { maximumFractionDigits: dp });

/** What the figure means, in a sentence. Descriptive only: never "cheap",
 *  "strong", "overbought" or any other judgement. */
export function plainSentence(key: MetricKey, v: number): string {
  switch (key) {
    case "per": return `The share price is ${n(v)} times the last twelve months' earnings per share.`;
    case "per_normalizado": return `The share price is ${n(v)} times earnings per share averaged over recent years.`;
    case "precio_valor_libros": return `The market values the company at ${n(v)} times the accounting value of its equity.`;
    case "ev_ebit": return `The company's value including its debt is ${n(v)} times its operating profit.`;
    case "fcf_yield": return v >= 0 ? `Free cash flow equals ${n(v)}% of the company's market value.` : `Free cash flow was negative, equal to −${n(v)}% of market value.`;
    case "roe": return `Each 100 of shareholders' money produced ${v < 0 ? "a loss of " : ""}${n(v)} of net profit.`;
    case "roa": return `Each 100 of assets produced ${v < 0 ? "a loss of " : ""}${n(v)} of net profit.`;
    case "roic": return `Each 100 invested by lenders and owners produced ${v < 0 ? "a loss of " : ""}${n(v)} of profit.`;
    case "margen_operativo": return v >= 0 ? `Of every 100 in sales, ${n(v)} was left as operating profit.` : `Operating costs exceeded sales by ${n(v)} per 100 of sales.`;
    case "deuda_patrimonio": return `Total debt equals ${n(v, 0)}% of shareholders' equity.`;
    case "deuda_neta_ebitda": return v < 0 ? "The company holds more cash than debt." : `Net debt equals ${n(v)} years of operating earnings (EBITDA).`;
    case "cobertura_intereses": return `Operating profit was ${n(v)} times the interest bill.`;
    case "crecimiento_ingresos_normalizado": return `Latest revenue is ${n(v)}% ${v >= 0 ? "above" : "below"} the average of earlier reported years.`;
    case "crecimiento_beneficios_normalizado": return `Latest net profit is ${n(v)}% ${v >= 0 ? "above" : "below"} the average of earlier reported years.`;
    default: return "";
  }
}
