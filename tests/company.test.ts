import { beforeAll, describe, expect, it, vi } from "vitest";
import { getCompanyProfile, getCompanyProfiles } from "@/lib/company";
import { positionIn } from "@/lib/stock-metrics";

// Uses the snapshot committed in data/universe/, never the live data repo.
beforeAll(() => {
  vi.stubEnv("SCREENER_REPO_TOKEN", "");
  vi.stubEnv("SCREENER_DATA_DIR", "");
});

describe("company page data", () => {
  it("measures a company in both indices against the first, the S&P 500", async () => {
    const p = await getCompanyProfile("AAPL");
    expect(p?.index).toBe("sp500");
    expect(p?.memberOf).toEqual(["sp500", "nasdaq100"]);
  });

  it("finds IBEX 35 companies by their Madrid ticker", async () => {
    expect((await getCompanyProfile("SAN.MC"))?.index).toBe("ibex35");
  });

  it("returns null outside the three indices", async () => {
    expect(await getCompanyProfile("SPY")).toBeNull();
  });

  it("shows ratios only: no price-based measures from the weekly snapshot", async () => {
    const p = (await getCompanyProfile("AAPL"))!;
    expect(p.groups.map((g) => g.group)).toEqual(["Valuation", "Profitability", "Debt", "Growth"]);
    const keys = p.groups.flatMap((g) => g.measures.map((m) => m.metric.key));
    for (const priceKey of ["precio_actual", "retorno_6m", "retorno_12m", "distancia_ma200_pct", "rsi"]) {
      expect(keys).not.toContain(priceKey);
    }
  });

  it("gives each measure its own position and never a group or total score (UK MAR)", async () => {
    const p = (await getCompanyProfile("AAPL"))!;
    for (const g of p.groups) {
      expect(Object.keys(g).sort()).toEqual(["group", "measures"]);
      for (const m of g.measures) {
        if (m.value === null) expect(m.position).toBeNull();
        else {
          expect(m.position).toBeGreaterThanOrEqual(0);
          expect(m.position).toBeLessThanOrEqual(100);
        }
      }
    }
    expect(Object.keys(p).sort()).toEqual(["company", "generatedAt", "groups", "index", "memberOf"]);
  });
});

describe("compare mode", () => {
  it("keeps the order given, each company measured against its own index", async () => {
    const [aapl, san, spy, msft] = await getCompanyProfiles(["AAPL", "SAN.MC", "SPY", "MSFT"]);
    expect([aapl?.company.ticker, san?.company.ticker, spy, msft?.company.ticker]).toEqual(["AAPL", "SAN.MC", null, "MSFT"]);
    expect(san?.index).toBe("ibex35");
    // Same measures in the same order for every company, so the table lines up.
    const keys = (p: typeof aapl) => p!.groups.flatMap((g) => g.measures.map((m) => m.metric.key));
    expect(keys(san)).toEqual(keys(aapl));
  });
});

describe("positionIn", () => {
  it("is the share below, counting ties as half", () => {
    expect(positionIn([1, 2, 3, 4], 3)).toBe(62.5); // 2 below + ½ tie, of 4
    expect(positionIn([1, 2, 3, 4], 0)).toBe(0);
    expect(positionIn([1, 2, 3, 4], 9)).toBe(100);
  });
});
