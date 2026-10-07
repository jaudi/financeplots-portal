import { describe, expect, it, vi } from "vitest";
import type { PriceHistory, PricePoint } from "@/lib/price-types";
import { callTool } from "./mcp-client";

// investment_return through the real MCP server. Prices are synthetic: an
// index that grows exactly 10% a year in USD, and a GBP/USD rate that never
// moves, so the expected figures can be worked by hand.

function steady(from: string, days: number, start: number, perYear: number): PricePoint[] {
  const out: PricePoint[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    out.push({ date: d.toISOString().slice(0, 10), close: start * (1 + perYear) ** (i / 365), ma200: null });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const DATA: Record<string, { currency: string; points: PricePoint[] }> = {
  "^TEN": { currency: "USD", points: steady("2018-01-01", 3200, 1000, 0.1) },
  "USDGBP=X": { currency: "GBP", points: steady("2018-01-01", 3200, 0.8, 0) },
  "PENCE.L": { currency: "GBp", points: steady("2018-01-01", 3200, 500, 0.1) },
};

vi.mock("@/lib/prices", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/prices")>();
  return {
    ...actual,
    getPriceHistory: async (symbol: string, range: PriceHistory["range"]): Promise<PriceHistory> => {
      const d = DATA[symbol];
      if (!d) throw new actual.UnknownSymbolError(symbol);
      return { symbol, name: `Index ${symbol}`, currency: d.currency, exchange: "", range, interval: "1d", points: d.points, stats: {} as PriceHistory["stats"] };
    },
  };
});

const FLOWS = [
  { date: "2020-01-01", amount: 1000 },
  { date: "2025-01-01", amount: 9000 },
];

describe("investment_return", () => {
  it("returns the XIRR next to the simple return, with a share link", async () => {
    const r = await callTool("investment_return", { flows: FLOWS, current_value: 11000, value_date: "2026-01-01", chart: false });
    expect(r.isError).toBe(false);
    expect(r.json).toMatchObject({
      annual_return_pct: 6.24,
      simple_return_pct: 10,
      gain: 1000,
      total_put_in: 10000,
      total_taken_out: 0,
      money_multiple: 1.1,
      first_date: "2020-01-01",
      value_date: "2026-01-01",
    });
    expect(r.json.comparison).toBeUndefined();
    expect(r.json.tool_page).toBe("https://www.financeplots.com/tools/investment-return?f=2020-01-01_1000%7E2025-01-01_9000&v=11000&on=2026-01-01");
  });

  it("replays the same flows in a named index: 10% a year whatever the timing", async () => {
    const r = await callTool("investment_return", { flows: FLOWS, current_value: 11000, value_date: "2026-01-01", compare_symbol: "^ten", chart: false });
    expect(r.json.comparison).toMatchObject({ symbol: "^TEN", measured_in: "USD", annual_return_pct: 10 });
    expect(r.json.comparison.difference_pct_points).toBe(-3.76);
    expect(r.json.comparison.note).toMatch(/dividends are not included/);
    expect(r.json.tool_page).toContain("vs=%5ETEN");
  });

  it("converts the index into the flows' currency (a flat FX rate leaves the return alone)", async () => {
    const r = await callTool("investment_return", { flows: FLOWS, current_value: 11000, value_date: "2026-01-01", compare_symbol: "^TEN", currency: "gbp", chart: false });
    expect(r.json.comparison).toMatchObject({ measured_in: "GBP", fx_rate_used: "USDGBP=X", annual_return_pct: 10 });
  });

  it("restates prices quoted in pence", async () => {
    const r = await callTool("investment_return", { flows: FLOWS, current_value: 11000, value_date: "2026-01-01", compare_symbol: "PENCE.L", chart: false });
    expect(r.json.comparison).toMatchObject({ measured_in: "GBP", annual_return_pct: 10 });
  });

  it("leaves the comparison out, with the reason, when the index history is too short", async () => {
    const r = await callTool("investment_return", {
      flows: [{ date: "2015-01-01", amount: 1000 }],
      current_value: 2000,
      value_date: "2026-01-01",
      compare_symbol: "^TEN",
      chart: false,
    });
    expect(r.isError).toBe(false);
    expect(r.json.comparison).toBeUndefined();
    expect(r.json.comparison_unavailable).toMatch(/starts on 2018-01-01/);
  });

  it("rejects bad inputs with a pointer", async () => {
    expect((await callTool("investment_return", { flows: [{ date: "2024-01-01", amount: -5 }], current_value: 10, value_date: "2025-01-01" })).text).toMatch(/money put in/);
    expect((await callTool("investment_return", { flows: [{ date: "2024-31-01", amount: 5 }], current_value: 10 })).text).toMatch(/YYYY-MM-DD/);
    expect((await callTool("investment_return", { flows: FLOWS, current_value: 10, compare_symbol: "NOPE" })).text).toMatch(/No price data/);
  });

  it("adds a short-period note under a year", async () => {
    const r = await callTool("investment_return", { flows: [{ date: "2025-06-01", amount: 1000 }], current_value: 1050, value_date: "2025-12-01", chart: false });
    expect(r.json.short_period_note).toMatch(/Less than a year/);
  });

  it("returns a chart: JSON first, then a PNG", async () => {
    const r = await callTool("investment_return", { flows: FLOWS, current_value: 11000, value_date: "2026-01-01", compare_symbol: "^TEN" });
    expect(r.isError).toBe(false);
    expect(r.json.annual_return_pct).toBe(6.24);
  });
});
