import { describe, expect, it } from "vitest";
import { callTool } from "./mcp-client";

// Figures worked by hand from GOV.UK "Rates and thresholds for employers 2026
// to 2027". If one moves, the rates or the maths changed.

describe("take_home_pay", () => {
  it("£70,000 in England: £15,432 tax, £3,410.60 NI, £4,263.12 a month", async () => {
    const r = (await callTool("take_home_pay", { gross_salary: 70_000 })).json;
    // Tax: 37,700 × 20% + (57,430 − 37,700) × 40%. NI: 37,700 × 8% + 19,730 × 2%.
    expect(r.yearly.income_tax).toBe(15_432);
    expect(r.yearly.national_insurance).toBe(3_410.6);
    expect(r.yearly.take_home).toBe(51_157.4);
    expect(r.monthly.take_home).toBe(4_263.12);
    expect(r.marginal_rate_pct).toBe(42);
    expect(r.tax_year).toBe("2026/27");
  });

  it("withdraws the personal allowance above £100,000: a 62% marginal rate at £110,000", async () => {
    const r = (await callTool("take_home_pay", { gross_salary: 110_000 })).json;
    expect(r.yearly.personal_allowance).toBe(7_570);
    expect(r.yearly.income_tax).toBe(33_432);
    expect(r.marginal_rate_pct).toBe(62);
  });

  it("uses Scotland's six bands", async () => {
    const r = (await callTool("take_home_pay", { gross_salary: 50_000, region: "scotland" })).json;
    // 3,967 × 19% + 12,989 × 20% + 14,136 × 21% + 6,338 × 42%
    expect(r.yearly.income_tax).toBeCloseTo(8_982.05, 2);
    expect(r.yearly.national_insurance).toBe(2_994.4); // NI is UK-wide: 37,430 × 8%
  });

  it("repays 9% of earnings above the Plan 2 threshold, rounded down", async () => {
    const r = (await callTool("take_home_pay", { gross_salary: 40_000, student_loan: "plan2" })).json;
    expect(r.yearly.student_loan).toBe(955); // (40,000 − 29,385) × 9% = 955.35
  });

  it("salary sacrifice saves tax and NI; relief at source costs 80p per £1 in the pot", async () => {
    const sacrifice = (await callTool("take_home_pay", { gross_salary: 70_000, pension_pct: 5 })).json;
    expect(sacrifice.yearly.income_tax).toBe(14_032);
    expect(sacrifice.yearly.national_insurance).toBe(3_340.6);
    expect(sacrifice.yearly.take_home).toBe(49_127.4);
    // £5 of the next £100 is sacrificed into the pension (not lost); 42% falls on the other £95.
    expect(sacrifice.marginal_rate_pct).toBe(39.9);

    const ras = (await callTool("take_home_pay", { gross_salary: 70_000, pension_pct: 5, pension_method: "relief_at_source" })).json;
    expect(ras.yearly.pension_from_pay).toBe(2_800);
    expect(ras.pension_into_pot).toBe(3_500);
    expect(ras.yearly.take_home).toBe(48_357.4);
  });

  it("finds the gross salary for a monthly take-home target", async () => {
    const r = (await callTool("take_home_pay", { target_monthly_take_home: 4_300 })).json;
    // Between £50,270 and £100,000, take-home = 0.58 × gross + 10,557.40.
    expect(r.gross_salary_needed).toBeCloseTo((51_600 - 10_557.4) / 0.58, 1);
    expect(r.monthly.take_home).toBeCloseTo(4_300, 2);
  });

  it("asks for exactly one of gross_salary or target_monthly_take_home", async () => {
    expect((await callTool("take_home_pay", {})).isError).toBe(true);
    expect((await callTool("take_home_pay", { gross_salary: 1, target_monthly_take_home: 1 })).isError).toBe(true);
  });
});
