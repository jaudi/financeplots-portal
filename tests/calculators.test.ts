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

describe("compound_interest — inflation (item 8)", () => {
  it("deflates the final value to today's money", async () => {
    const args = { initial_capital: 10_000, monthly_contribution: 500, annual_return_pct: 6, years: 20 };
    const nominal = (await callTool("compound_interest", args)).json;
    expect(nominal.real_final_value).toBeUndefined();
    const r = (await callTool("compound_interest", { ...args, inflation_pct: 2.5 })).json;
    expect(r.final_value).toBe(nominal.final_value);
    expect(r.real_final_value).toBe(Math.round(nominal.final_value / 1.025 ** 20));
  });
});

describe("loan_repayment — overpaying (item 8)", () => {
  it("counts the months and interest an extra monthly payment saves", async () => {
    const args = { amount: 200_000, annual_rate_pct: 5, years: 25 };
    const base = (await callTool("loan_repayment", args)).json;
    expect(base.with_extra_payment).toBeUndefined();

    const r = (await callTool("loan_repayment", { ...args, extra_monthly_payment: 200 })).json.with_extra_payment;
    expect(r.monthly_payment).toBe(1369.18);
    // Closed form: n = −ln(1 − rB/P) / ln(1 + r)
    const i = 0.05 / 12;
    const n = Math.ceil(-Math.log(1 - (i * 200_000) / (1169.18 + 200)) / Math.log(1 + i));
    expect(r.months_to_repay).toBe(n);
    expect(r.months_saved).toBe(300 - n);
    expect(r.interest_saved).toBeGreaterThan(0);
    expect(r.interest_saved).toBeCloseTo(base.total_interest - r.total_interest, 1);
  });
});

describe("industry_multiples (item 8)", () => {
  it("says the figures are US listed-company averages", async () => {
    const r = (await callTool("industry_multiples")).json;
    expect(r.note).toMatch(/US listed companies/);
    expect(r.industries.find((i: { id: string }) => i.id === "healthcare-it")).toMatchObject({ ev_sales: 5.3, cost_of_capital_pct: 8.22 });
  });
});
