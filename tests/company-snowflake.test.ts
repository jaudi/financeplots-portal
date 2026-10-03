import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { THEMES } from "@/lib/charts/layout";
import { FLAT, layoutRadar, TILTED, type RadarSpec } from "@/lib/charts/radar";
import { CHARTS_META_KEY } from "@/lib/charts/spec";
import { createFinancePlotsServer } from "@/lib/mcp-server";
import { callTool } from "./mcp-client";

// Ratios come from the committed screener snapshot, never the live data repo.
beforeAll(() => {
  vi.stubEnv("SCREENER_REPO_TOKEN", "");
  vi.stubEnv("SCREENER_DATA_DIR", "");
});

async function rawCall(args: Record<string, unknown>) {
  const [c, s] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([createFinancePlotsServer().connect(s), client.connect(c)]);
  try {
    return await client.callTool({ name: "company_snowflake", arguments: args });
  } finally {
    await client.close();
  }
}

describe("company_snowflake", () => {
  it("returns each ratio's position, a PNG and the snowflake spec", async () => {
    const res = await rawCall({ ticker: "aapl" });
    const content = res.content as { type: string; text?: string; data?: string }[];
    const body = JSON.parse(content[0].text!);
    expect(body.companies).toHaveLength(1);
    expect(body.companies[0]).toMatchObject({ ticker: "AAPL", index: "sp500" });
    expect(body.tool_page).toBe("https://www.financeplots.com/tools/stocks/AAPL");
    expect(content.filter((c) => c.type === "image")).toHaveLength(1);
    const [spec] = (res._meta as Record<string, RadarSpec[]>)[CHARTS_META_KEY];
    expect(spec.kind).toBe("radar");
    expect(spec.spokes).toHaveLength(body.companies[0].measures.length);
    expect(spec.layers[0].positions).toEqual(body.companies[0].measures.map((m: { higher_than_pct_of_index: number | null }) => m.higher_than_pct_of_index === null ? null : expect.any(Number)));
  });

  it("draws a second company as a second layer", async () => {
    const r = await callTool("company_snowflake", { ticker: "MSFT", compare_with: ["SAN.MC"], chart: false });
    expect(r.json.companies.map((c: { ticker: string }) => c.ticker)).toEqual(["MSFT", "SAN.MC"]);
    expect(r.json.tool_page).toBe("https://www.financeplots.com/tools/stocks/MSFT?vs=SAN.MC");
  });

  it("compares two companies at most, and names a ticker it can't cover", async () => {
    expect((await callTool("company_snowflake", { ticker: "MSFT", compare_with: ["SAN.MC", "AAPL"] })).isError).toBe(true);
    const r = await callTool("company_snowflake", { ticker: "AAPL", compare_with: ["SPY"], chart: false });
    expect(r.json.not_covered).toEqual(["SPY"]);
    expect(r.json.companies).toHaveLength(1);
  });

  it("never returns a score, rank, total or price (UK MAR)", async () => {
    const r = await callTool("company_snowflake", { ticker: "AAPL", compare_with: ["MSFT"], chart: false });
    expect(JSON.stringify(r.json)).not.toMatch(/"(score|rank|rating|total|area|recommendation)"/);
    const aliases = r.json.companies[0].measures.map((m: { alias: string }) => m.alias);
    for (const k of ["price", "return_6m", "return_12m", "distance_ma200_pct", "rsi"]) expect(aliases).not.toContain(k);
  });

  it("explains what it covers when there are no figures", async () => {
    const r = await callTool("company_snowflake", { ticker: "SPY" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/S&P 500/);
  });
});

describe("snowflake layout", () => {
  const spec: RadarSpec = {
    kind: "radar",
    title: "Test",
    spokes: ["A", "B", "C", "D", "E"].map((label, i) => ({ label, group: i < 3 ? "One" : "Two" })),
    layers: [
      { name: "X", within: "S&P 500", positions: [10, 90, null, 50, 100], values: ["1", "2", "—", "4", "5"] },
      { name: "Y", within: "IBEX 35", positions: [0, 20, 40, 60, 80], values: ["1", "2", "3", "4", "5"] },
    ],
  };

  it.each([["flat", FLAT], ["3D", TILTED], ["turned", { yaw: 2, pitch: 1.2 }]])("stays inside its frame (%s)", (_, view) => {
    for (const theme of [THEMES.dark, THEMES.light]) {
      const scene = layoutRadar(spec, { width: 800, height: 620, theme, view });
      expect(JSON.stringify(scene.shapes)).not.toMatch(/NaN|Infinity/);
      for (const t of scene.texts) {
        expect(t.y, t.text).toBeGreaterThanOrEqual(0);
        expect(t.y, t.text).toBeLessThanOrEqual(620);
      }
      expect(scene.nodes).toHaveLength(10);
      for (const nd of scene.nodes) {
        expect(nd.x).toBeGreaterThan(0);
        expect(nd.x).toBeLessThan(800);
      }
    }
  });

  it("puts a higher position further out, flat", () => {
    const scene = layoutRadar(spec, { width: 800, height: 620, theme: THEMES.dark, view: FLAT });
    const centre = { x: scene.plot.x + scene.plot.w / 2, y: scene.plot.y + scene.plot.h / 2 };
    const dist = (spoke: number) => {
      const nd = scene.nodes.find((n) => n.layer === 0 && n.spoke === spoke)!;
      return Math.hypot(nd.x - centre.x, nd.y - centre.y);
    };
    expect(dist(1)).toBeGreaterThan(dist(3));
    expect(dist(3)).toBeGreaterThan(dist(0));
  });
});
