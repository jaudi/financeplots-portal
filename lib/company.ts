import { METRIC_GROUPS, METRICS, positionIn, type MetricDef, type MetricGroup } from "@/lib/stock-metrics";
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
  ibex35: "IBEX 35",
  ftse100: "FTSE 100",
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
  /** The index positions are measured against: the first of S&P 500, Nasdaq-100, IBEX 35, FTSE 100 it belongs to. */
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
