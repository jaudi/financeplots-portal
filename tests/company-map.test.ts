import { beforeAll, describe, expect, it, vi } from "vitest";
import hqLocations from "@/data/hq-locations.json";
import { getCompanyProfile } from "@/lib/company";
import { cardFrom, getCompanyMapData, MAP_FIELDS } from "@/lib/company-map";
import { METRICS } from "@/lib/stock-metrics";
import { getUniverse, UNIVERSE_SCREENS } from "@/lib/universe";

// The company map follows the screener's neutrality (CLAUDE.md, UK MAR): a dot
// carries who and where, nothing that could rank one company above another,
// and the card shows the company page's ratios — no snapshot price measures.

// Uses the snapshot committed in data/universe/, never the live data repo.
beforeAll(() => {
  vi.stubEnv("SCREENER_REPO_TOKEN", "");
  vi.stubEnv("SCREENER_DATA_DIR", "");
});

const OPINION = /score|rank|percentil|rating|grade|verdict|featured|recommend|weight|top/i;
const PRICE_KEYS = METRICS.filter((m) => m.group === "Price & trend").map((m) => m.key);

/** Every key anywhere in a value, however deep. */
function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => [k, ...allKeys(v)]);
  return [];
}

describe("company map data", () => {
  it("gives each dot only who and where — no score, rank or figure", async () => {
    const { companies } = await getCompanyMapData();
    expect(companies.length).toBeGreaterThan(600);
    for (const c of companies) expect(Object.keys(c).sort()).toEqual([...MAP_FIELDS].sort());
    const keys = new Set(allKeys(companies));
    for (const k of keys) expect(k).not.toMatch(OPINION);
    for (const k of PRICE_KEYS) expect(keys.has(k)).toBe(false);
  });

  it("shows every company in the indices: placed, or listed as missing — none dropped", async () => {
    const { companies, missing } = await getCompanyMapData();
    const universe = new Set(
      (await Promise.all(UNIVERSE_SCREENS.map((s) => getUniverse(s)))).flatMap((u) => u?.companies.map((c) => c.ticker) ?? []),
    );
    const onMap = [...companies, ...missing].map((c) => c.ticker);
    expect(new Set(onMap)).toEqual(universe);
    expect(onMap.length).toBe(universe.size);
  });

  it("lists companies A–Z by ticker, never in an order of its own", async () => {
    const tickers = (await getCompanyMapData()).companies.map((c) => c.ticker);
    expect(tickers).toEqual([...tickers].sort((a, b) => a.localeCompare(b)));
  });

  it("keeps a company in every index it belongs to", async () => {
    const { companies } = await getCompanyMapData();
    expect(companies.find((c) => c.ticker === "AAPL")?.indices).toEqual(["sp500", "nasdaq100"]);
  });

  it("has real coordinates for every placed company", async () => {
    for (const c of (await getCompanyMapData()).companies) {
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
      expect(c.city).toBeTruthy();
      expect(c.country).toBeTruthy();
    }
  });

  it("keeps the location file to places and their sources", () => {
    // Tickers are keys too (any of them could contain "TOP"), so check the fields.
    const { locations, ...rest } = hqLocations as unknown as { locations: Record<string, object> };
    const fields = new Set([...Object.keys(rest), ...Object.values(locations).flatMap((l) => Object.keys(l))]);
    expect([...fields].sort()).toEqual(["count", "generated_at", "missing", "sources", "city", "country", "lat", "lon", "source"].sort());
  });
});

describe("company map card", () => {
  it("shows the company page's ratios with positions, and no price-based measure", async () => {
    const card = cardFrom((await getCompanyProfile("AAPL"))!);
    expect(card.indexLabel).toBe("S&P 500");
    expect(card.groups.map((g) => g.group)).toEqual(["Valuation", "Profitability", "Debt", "Growth"]);
    const keys = card.groups.flatMap((g) => g.measures.map((m) => m.key));
    for (const k of PRICE_KEYS) expect(keys).not.toContain(k);
    for (const k of allKeys(card)) expect(k).not.toMatch(OPINION);
  });

  it("describes figures without judging them", async () => {
    const card = cardFrom((await getCompanyProfile("SAN.MC"))!);
    const text = card.groups.flatMap((g) => g.measures.map((m) => m.sentence ?? "")).join(" ");
    expect(text).not.toMatch(/\b(cheap|expensive|strong|weak|good|bad|healthy|risky|attractive|overvalued|undervalued)\b/i);
  });
});
