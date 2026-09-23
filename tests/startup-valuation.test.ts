import { describe, expect, it } from "vitest";
import { callTool } from "./mcp-client";

describe("startup_valuation — revenue multiple (item 3)", () => {
  it("takes the private discount off enterprise value only, then adds cash", async () => {
    const r = await callTool("startup_valuation", { revenue: 3_000_000, industry: "healthcare-it", net_cash: 8_000_000, private_discount_pct: 25 });
    const m = r.json.revenue_multiple;
    expect(m.ev_sales_multiple).toBe(5.3);
    expect(m.enterprise_value).toBe(15_900_000);
    expect(m.equity_value).toBe(23_900_000);
    expect(m.equity_value_after_discount).toBe(19_925_000); // was 17,925,000
  });

  it("warns that an industry multiple assumes mature margins when the company is loss-making", async () => {
    const r = await callTool("startup_valuation", {
      revenue: 3_000_000,
      industry: "healthcare-it",
      current_operating_margin_pct: -150,
      revenue_growth_pct: 60,
    });
    expect(r.json.warnings).toContainEqual(expect.stringMatching(/assumes mature margins/));

    const mature = await callTool("startup_valuation", { revenue: 3_000_000, industry: "healthcare-it" });
    expect(mature.json.warnings).toBeUndefined();
  });
});

describe("startup_valuation — Damodaran DCF (unchanged)", () => {
  it("reproduces the reviewed young-company valuation", async () => {
    const r = await callTool("startup_valuation", {
      revenue: 3_000_000,
      revenue_growth_pct: 60,
      current_operating_margin_pct: -150,
      industry: "healthcare-it",
      initial_cost_of_capital_pct: 14,
      failure_probability_pct: 30,
      net_cash: 8_000_000,
      net_operating_loss: 20_000_000,
    });
    expect(r.json.dcf.value_if_it_survives).toBe(11_997_243);
    expect(r.json.dcf.equity_value).toBe(16_398_070);
    // The first tax is paid in year 9, once the carried-forward losses are used up.
    expect(r.json.dcf.years.findIndex((y: { tax: number }) => y.tax > 0) + 1).toBe(9);
  });
});
