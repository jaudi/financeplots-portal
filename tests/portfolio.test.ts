import { describe, expect, it, vi } from "vitest";
import type { PriceHistory, PricePoint } from "@/lib/price-types";
import { callTool } from "./mcp-client";

// Synthetic, deterministic price series stand in for Yahoo Finance.

function series(start: number, drift: number, wobble: number, seed: number, days = 400): PricePoint[] {
  const out: PricePoint[] = [];
  let p = start;
  let s = seed;
  const d = new Date("2025-09-01T00:00:00Z");
  for (let i = 0; i < days; i++) {
    s = (s * 16807) % 2147483647;
    p *= 1 + drift + wobble * ((s / 2147483647) * 2 - 1);
    out.push({ date: d.toISOString().slice(0, 10), close: p, ma200: null });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const FLAT_EUR = series(10, 0, 0, 1); // a EUR asset whose price never moves
const DATA: Record<string, { currency: string; points: PricePoint[] }> = {
  VOO: { currency: "USD", points: series(500, 0.0006, 0.012, 7) },
  "SAN.MC": { currency: "EUR", points: series(8, 0.0012, 0.02, 11) },
  GLD: { currency: "USD", points: series(300, 0.0008, 0.009, 13) },
  FLAT: { currency: "EUR", points: FLAT_EUR },
  // EUR gains exactly 10% against USD over the period, in a straight line
  "EURUSD=X": { currency: "USD", points: FLAT_EUR.map((p, i) => ({ ...p, close: 1.1 * (1 + (0.1 * i) / (FLAT_EUR.length - 1)) })) },
};

vi.mock("@/lib/prices", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/prices")>();
  return {
    ...actual,
    getPriceHistory: async (symbol: string, range: PriceHistory["range"]): Promise<PriceHistory> => {
      const d = DATA[symbol];
      if (!d) throw new actual.UnknownSymbolError(symbol);
      return { symbol, name: symbol, currency: d.currency, exchange: "", range, interval: "1d", points: d.points, stats: {} as PriceHistory["stats"] };
    },
  };
});

const PORTFOLIO = {
  holdings: [
    { symbol: "VOO", weight: 60 },
    { symbol: "SAN.MC", weight: 20 },
    { symbol: "GLD", weight: 20 },
  ],
  range: "1y",
  risk_free_pct: 3.88,
};

describe("portfolio_analysis (item 4)", () => {
  it("keeps its maths: Sharpe = (annualised − rf) / vol, risk shares sum to 100", async () => {
    const r = (await callTool("portfolio_analysis", PORTFOLIO)).json;
    const p = r.portfolio;
    expect(p.sharpe).toBeCloseTo((p.annualised_pct - 3.88) / p.volatility_pct, 1);
    const shares = r.holdings.reduce((s: number, h: { risk_share_pct: number }) => s + h.risk_share_pct, 0);
    expect(shares).toBeCloseTo(100, 0);
  });

  it("adds period-labelled VaR fields and keeps the old ones with the same values", async () => {
    const p = (await callTool("portfolio_analysis", PORTFOLIO)).json.portfolio;
    expect(p.var95_daily_pct).toBe(p.var95_pct);
    expect(p.expected_shortfall_95_daily_pct).toBe(p.expected_shortfall_95_pct);
    expect(p.var95_daily_pct).toBeGreaterThan(0);

    const weekly = (await callTool("portfolio_analysis", { ...PORTFOLIO, range: "max" })).json.portfolio;
    expect(weekly.var95_weekly_pct).toBe(weekly.var95_pct);
    expect(weekly.var95_daily_pct).toBeUndefined();
  });

  it("warns about mixed currencies when no base currency is given", async () => {
    const r = (await callTool("portfolio_analysis", PORTFOLIO)).json;
    expect(r.base_currency).toBeNull();
    expect(r.warnings).toContainEqual(expect.stringMatching(/different currencies \(USD, EUR\)/));
  });

  it("converts each holding to the base currency before computing returns", async () => {
    const inEur = (await callTool("portfolio_analysis", { holdings: [{ symbol: "FLAT", weight: 1 }] })).json;
    expect(inEur.holdings[0].change_pct).toBe(0);

    const inUsd = (await callTool("portfolio_analysis", { holdings: [{ symbol: "FLAT", weight: 1 }], base_currency: "usd" })).json;
    expect(inUsd.base_currency).toBe("USD");
    expect(inUsd.fx_rates_used).toEqual({ EUR: "EURUSD=X" });
    expect(inUsd.holdings[0].measured_in).toBe("USD");
    expect(inUsd.holdings[0].change_pct).toBeCloseTo(10, 1); // all of it currency
    expect(inUsd.warnings).toBeUndefined();
  });

  it("fails clearly when there is no FX series for a currency", async () => {
    const r = await callTool("portfolio_analysis", { ...PORTFOLIO, base_currency: "CHF" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/No FX history to convert/);
  });
});
