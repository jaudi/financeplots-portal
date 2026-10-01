import { beforeAll, describe, expect, it, vi } from "vitest";
import type { FinancialHistory } from "@/lib/edgar";
import { callTool } from "./mcp-client";

// Ratios come from the committed screener snapshot; the SEC is mocked.
beforeAll(() => {
  vi.stubEnv("SCREENER_REPO_TOKEN", "");
  vi.stubEnv("SCREENER_DATA_DIR", "");
});

const APPLE: FinancialHistory = {
  cik: "0000320193",
  years: [
    { end: "2024-09-28", revenue: 391e9, netIncome: 93.7e9, operatingCashFlow: 118e9, capex: 9.4e9, freeCashFlow: 108.6e9, cash: 29.9e9, debt: 96.7e9 },
    { end: "2025-09-27", revenue: 416e9, netIncome: 112e9, operatingCashFlow: 111.5e9, capex: 12.7e9, freeCashFlow: 98.8e9, cash: 35.9e9, debt: 90.7e9 },
  ],
  available: { revenue: true, netIncome: true, cashFlow: true, balance: true },
  source: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=10-K",
};

vi.mock("@/lib/edgar", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/edgar")>();
  return {
    ...actual,
    tryFinancialHistory: vi.fn(async (t: string) => (t === "AAPL" ? APPLE : t === "DOWN" ? "unavailable" : null)),
  };
});

describe("company_profile", () => {
  it("gives the ratios with their index positions, and the annual-report history", async () => {
    const r = await callTool("company_profile", { ticker: "aapl", chart: false });
    expect(r.isError).toBe(false);
    expect(r.json).toMatchObject({ ticker: "AAPL", name: "Apple Inc.", index: "sp500", member_of: ["sp500", "nasdaq100"] });
    const pe = r.json.measures.find((m: { alias: string }) => m.alias === "pe");
    expect(pe).toMatchObject({ key: "per", group: "Valuation", unit: "x" });
    expect(pe.higher_than_pct_of_index).toBeGreaterThanOrEqual(0);
    expect(r.json.history.years.at(-1)).toMatchObject({ fiscal_year_end: "2025-09-27", free_cash_flow: 98.8e9 });
    expect(r.json.tool_page).toBe("https://www.financeplots.com/tools/stocks/AAPL");
  });

  it("never returns price-based measures, a score or a rank (UK MAR)", async () => {
    const r = (await callTool("company_profile", { ticker: "AAPL", chart: false })).json;
    const keys = r.measures.map((m: { key: string }) => m.key);
    for (const k of ["precio_actual", "retorno_6m", "retorno_12m", "distancia_ma200_pct", "rsi"]) expect(keys).not.toContain(k);
    expect(JSON.stringify(r)).not.toMatch(/"(score|rank|rating|recommendation)"/);
  });

  it("works outside the US, without history", async () => {
    const r = (await callTool("company_profile", { ticker: "SAN.MC", chart: false })).json;
    expect(r.index).toBe("ibex35");
    expect(r.history).toBeNull();
  });

  it("charts the history", async () => {
    const r = await callTool("company_profile", { ticker: "AAPL" });
    expect(r.text).toContain("Apple");
    expect(r.isError).toBe(false);
  });

  it("explains what it covers when there are no figures", async () => {
    const r = await callTool("company_profile", { ticker: "SPY" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/price_history/);
  });

  it("says when the SEC didn't answer, rather than that there is nothing", async () => {
    const r = await callTool("company_profile", { ticker: "DOWN" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/try again/i);
  });
});
