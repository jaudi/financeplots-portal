import { beforeAll, describe, expect, it, vi } from "vitest";
import { callTool } from "./mcp-client";

// Uses the snapshot committed in data/universe/, never the live data repo.
beforeAll(() => {
  vi.stubEnv("SCREENER_REPO_TOKEN", "");
  vi.stubEnv("SCREENER_DATA_DIR", "");
});

type Row = { ticker: string; sector: string } & Record<string, number | null | string>;

const sortedAZ = (rows: Row[]) => rows.map((c) => c.ticker).join() === rows.map((c) => c.ticker).sort().join();

describe("screen_stocks (item 6)", () => {
  it("accepts English aliases and gives the same matches as the original keys", async () => {
    const es = (await callTool("screen_stocks", { index: "sp500", filters: [{ metric: "per", max: 15 }, { metric: "deuda_neta_ebitda", max: 1 }], limit: 500 })).json;
    const en = (await callTool("screen_stocks", { index: "sp500", filters: [{ metric: "pe", max: 15 }, { metric: "net_debt_to_ebitda", max: 1 }], limit: 500 })).json;
    expect(en.match_count).toBeGreaterThan(0);
    expect(en.companies.map((c: Row) => c.ticker)).toEqual(es.companies.map((c: Row) => c.ticker));
    // Each response uses the names its request used.
    expect(en.companies[0].pe).toBe(es.companies[0].per);
    expect(es.companies[0].pe).toBeUndefined();
  });

  it("caps rows at 50 by default, alphabetical, and says so", async () => {
    const r = (await callTool("screen_stocks", { index: "sp500", filters: [{ metric: "roe", min: 0 }] })).json;
    expect(r.match_count).toBeGreaterThan(50);
    expect(r.returned).toBe(50);
    expect(r.truncated).toBe(true);
    expect(r.order).toBe("alphabetical by ticker");
    expect(sortedAZ(r.companies)).toBe(true);

    const all = (await callTool("screen_stocks", { index: "sp500", filters: [{ metric: "roe", min: 0 }], limit: 500 })).json;
    expect(all.truncated).toBe(false);
    expect(all.returned).toBe(all.match_count);
    expect(all.companies.slice(0, 50)).toEqual(r.companies);
  });

  it("returns extra `fields` without filtering on them", async () => {
    const r = (await callTool("screen_stocks", { index: "ibex35", filters: [{ metric: "roe", min: 10 }], fields: ["operating_margin", "per"] })).json;
    expect(Object.keys(r.companies[0])).toEqual(["ticker", "name", "sector", "roe", "operating_margin", "per"]);
  });

  it("still requires a criterion", async () => {
    const r = await callTool("screen_stocks", { index: "sp500", fields: ["roe"] });
    expect(r.isError).toBe(true);
  });
});

describe("screener_metrics (item 6)", () => {
  it("lists the sectors of each index, with no N/A", async () => {
    const r = (await callTool("screener_metrics")).json;
    for (const index of ["sp500", "nasdaq100", "ibex35"]) {
      expect(r.sectors[index].length).toBeGreaterThan(5);
      expect(r.sectors[index]).not.toContain("N/A");
    }
    expect(r.sectors.sp500).toContain("Unclassified"); // the one S&P company Yahoo gives no sector
  });

  it("gives every measure an English alias", async () => {
    const r = (await callTool("screener_metrics")).json;
    const per = r.metrics.find((m: { key: string }) => m.key === "per");
    expect(per.alias).toBe("pe");
    expect(r.metrics.find((m: { key: string }) => m.key === "roe").alias).toBe("roe");
  });

  it("lets a sector from the list be used as a filter", async () => {
    const r = (await callTool("screen_stocks", { index: "sp500", sector: "Unclassified" })).json;
    expect(r.match_count).toBe(1);
  });
});
