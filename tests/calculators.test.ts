import { describe, expect, it } from "vitest";
import { callTool } from "./mcp-client";

// Figures checked by hand in the external review (September 2026).

describe("loan_repayment", () => {
  it("£200k at 5% over 25 years costs £1,169.18 a month", async () => {
    const r = await callTool("loan_repayment", { amount: 200_000, annual_rate_pct: 5, years: 25 });
    expect(r.json.monthly_payment).toBe(1169.18);
  });
});

describe("compound_interest", () => {
  it("matches the closed-form future value of a lump sum plus monthly contributions", async () => {
    const r = await callTool("compound_interest", { initial_capital: 10_000, monthly_contribution: 500, annual_return_pct: 6, years: 20 });
    const i = 0.06 / 12;
    const n = 240;
    const closedForm = 10_000 * (1 + i) ** n + (500 * ((1 + i) ** n - 1)) / i;
    expect(Math.abs(r.json.final_value - closedForm)).toBeLessThan(1);
  });
});

describe("break_even", () => {
  it("gives 1,250 units and a 16.7% margin of safety", async () => {
    const r = await callTool("break_even", { fixed_costs: 50_000, selling_price: 100, variable_cost: 60, current_units: 1_500 });
    expect(r.json.break_even_units).toBe(1250);
    expect(r.json.margin_of_safety_pct).toBeCloseTo(16.67, 1);
  });
});
