import hqLocations from "@/data/hq-locations.json";
import { INDEX_LABELS, plainSentence, type CompanyProfile } from "@/lib/company";
import { formatMetric, type MetricGroup, type MetricKey } from "@/lib/stock-metrics";
import { getUniverse, UNIVERSE_SCREENS, type UniverseScreen } from "@/lib/universe";

// The company map (/tools/company-map): one dot per company in the four
// indices, at its headquarters (data/hq-locations.json, built by
// scripts/hq-locations.mjs from Wikidata and SEC EDGAR).
//
// Same neutrality as the screener (CLAUDE.md, UK MAR). A dot carries who and
// where — never a figure, score, rank or price — so nothing about a dot can
// make one company stand out. The figures come only in the card a visitor
// opens, and those are the company page's ratios with their positions.

/** Everything a dot knows. An allowlist: tests/company-map.test.ts fails if
 *  anything else reaches the browser. */
export const MAP_FIELDS = ["ticker", "name", "sector", "indices", "city", "country", "lat", "lon"] as const;

export interface MapCompany {
  ticker: string;
  name: string;
  sector: string;
  /** The indices it is in, in the site's usual order. */
  indices: UniverseScreen[];
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CompanyMapData {
  /** Placed companies, A–Z by ticker. */
  companies: MapCompany[];
  /** Companies in the indices with no known headquarters: listed, not guessed. */
  missing: Pick<MapCompany, "ticker" | "name" | "sector" | "indices">[];
  generatedAt: string | null;
}

/** FTSE 100 names arrive as the share line ("ASTRAZENECA PLC ORD SHS $0.25"):
 *  the map shows the company's part only. */
export function companyName(name: string): string {
  return name.replace(/\s+(ORD|ORDS|ORDINARY|SHS)\b.*$/, "").trim() || name;
}

type HqFile = { locations: Record<string, { city: string; country: string; lat: number; lon: number }> };
const LOCATIONS = (hqLocations as unknown as HqFile).locations;

/** A company's headquarters, for the company page's link to the map. */
export function headquartersOf(ticker: string): { city: string; country: string } | null {
  const at = LOCATIONS[ticker];
  return at ? { city: at.city, country: at.country } : null;
}

export async function getCompanyMapData(): Promise<CompanyMapData> {
  const universes = (await Promise.all(UNIVERSE_SCREENS.map((s) => getUniverse(s)))).filter((u) => u !== null);
  const byTicker = new Map<string, Pick<MapCompany, "ticker" | "name" | "sector" | "indices">>();
  for (const u of universes) {
    for (const c of u.companies) {
      const seen = byTicker.get(c.ticker);
      if (seen) seen.indices.push(u.screen);
      else byTicker.set(c.ticker, { ticker: c.ticker, name: companyName(c.nombre), sector: c.sector, indices: [u.screen] });
    }
  }

  const companies: MapCompany[] = [];
  const missing: CompanyMapData["missing"] = [];
  for (const c of [...byTicker.values()].sort((a, b) => a.ticker.localeCompare(b.ticker))) {
    const at = LOCATIONS[c.ticker];
    if (!at) {
      missing.push(c);
      continue;
    }
    companies.push({ ...c, city: at.city, country: at.country, lat: at.lat, lon: at.lon });
  }

  const dates = universes.map((u) => u.generated_at).filter((d): d is string => d !== null).sort();
  return { companies, missing, generatedAt: dates.at(-1) ?? null };
}

// ── The card ────────────────────────────────────────────────────────────────

export interface CardMeasure {
  key: MetricKey;
  label: string;
  glossary: string | null;
  /** The figure with its unit, "—" when there is none. */
  display: string;
  /** The plain-English line, as on the company page. */
  sentence: string | null;
  /** Share of the index with a lower figure, 0–100. A position, not a grade. */
  position: number | null;
}

export interface MapCard {
  ticker: string;
  name: string;
  sector: string;
  memberOf: UniverseScreen[];
  /** Positions are measured within this index. */
  indexLabel: string;
  generatedAt: string | null;
  groups: { group: MetricGroup; measures: CardMeasure[] }[];
}

/** The company page's ratios for one company, ready for the card. The profile
 *  already leaves out the snapshot's price-based measures. */
export function cardFrom(profile: CompanyProfile): MapCard {
  return {
    ticker: profile.company.ticker,
    name: companyName(profile.company.nombre),
    sector: profile.company.sector,
    memberOf: profile.memberOf,
    indexLabel: INDEX_LABELS[profile.index],
    generatedAt: profile.generatedAt,
    groups: profile.groups.map(({ group, measures }) => ({
      group,
      measures: measures.map((m) => ({
        key: m.metric.key,
        label: m.metric.label,
        glossary: m.metric.glossary ?? null,
        display: formatMetric(m.value, m.metric),
        sentence: m.value === null ? null : plainSentence(m.metric.key, m.value),
        position: m.position,
      })),
    })),
  };
}
