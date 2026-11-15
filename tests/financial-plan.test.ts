import { describe, expect, it } from "vitest";
import { monthlyPayment, takeHomePay } from "@/lib/calculators";
import { decodePlan, encodePlan, financialPlan, project, SCENARIOS, type CompletePlan, type FactFind } from "@/lib/financial-plan";

// Figures pinned from the Python reference (reference/planning-tools/financial_plan.py).

const EXAMPLE: FactFind = {
  age: 50,
  retire_age: 67,
  gross_salary: 70_000,
  employee_pension_pct: 5,
  employer_pension_pct: 5,
  pension_pot: 60_000,
  savings: 80_000,
  spending_per_year: 30_000,
  housing: { type: "own", home_value: 450_000, mortgage_left: 290_000, mortgage_rate_pct: 4.5, years_left: 16 },
  has_partner: false,
  assumptions_confirmed: true,
};
const plan = () => financialPlan(EXAMPLE) as CompletePlan;

describe("questions come first", () => {
  it("asks one question at a time, in order, and projects nothing", () => {
    const r = financialPlan({});
    expect(r.status).toBe("needs_more_information");
    if (r.status !== "needs_more_information") return;
    expect(r.next_question.field).toBe("age");
    expect(r.still_missing).toEqual(["age", "retire_age", "gross_salary", "has_partner", "pension_pot", "savings", "spending_per_year", "housing"]);
    expect(r.instruction).toMatch(/Do not guess/);
    expect(r).not.toHaveProperty("findings");
  });

  it("asks for the mortgage details of an owner, but not the rate when nothing is owed", () => {
    const ask = (housing: FactFind["housing"]) => {
      const r = financialPlan({ ...EXAMPLE, housing });
      return r.status === "needs_more_information" ? r.still_missing : [];
    };
    expect(ask({ type: "own", home_value: 450_000 })).toEqual(["housing.mortgage_left", "housing.mortgage_rate_pct", "housing.years_left"]);
    expect(ask({ type: "own", home_value: 450_000, mortgage_left: 0 })).toEqual([]);
    expect(ask({ type: "rent" })).toEqual(["housing.rent_monthly"]);
  });

  it("asks whether a partner's money is in the figures", () => {
    const r = financialPlan({ ...EXAMPLE, has_partner: true });
    expect(r.status === "needs_more_information" && r.next_question.field).toBe("partner_included_in_figures");
  });

  it("makes the user confirm the assumptions before projecting", () => {
    const r = financialPlan({ ...EXAMPLE, assumptions_confirmed: undefined });
    expect(r.status).toBe("confirm_assumptions");
    if (r.status !== "confirm_assumptions") return;
    expect(r.assumptions_to_confirm.find((a) => a.name === "return_pct")).toMatchObject({ value: 5, given_by_user: false });
    expect(r.assumptions_to_confirm.find((a) => a.name === "employer_pension_pct")).toMatchObject({ value: 5, given_by_user: true });
  });
});

describe("the reference example", () => {
  it("uses the same take-home and mortgage as the site's tools", () => {
    expect(takeHomePay({ grossSalary: 70_000, pensionPct: 5 }).takeHome).toBe(49_127.4);
    expect(monthlyPayment(0.045, 16, 290_000)).toBeCloseTo(2_121.57, 2);
  });

  it("pins cashflow today and the milestones", () => {
    const f = plan().findings;
    expect(f.cashflow_today).toEqual({ net_income: 49_127, spending: 30_000, housing: 25_459, surplus_or_gap: -6_332 });
    expect(f.milestones).toEqual({ mortgage_paid_off_age: 66, retire_age: 67, state_pension_age: 67, bridge_years_before_state_pension: 0, earliest_pension_access_age: 57, tax_free_cash: 55_481 });
  });

  it("pins every stress test", () => {
    const s = plan().findings.scenarios;
    const got = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, [v.outcome, v.liquid_at_end]]));
    expect(got).toEqual({
      base: ["runs out at 87", -134_466],
      market_fall: ["runs out at 82", -215_700],
      low_returns: ["runs out at 80", -252_222],
      high_inflation: ["runs out at 82", -212_872],
      live_to_100: ["runs out at 87", -221_728],
    });
    expect(plan().findings.resilience).toBe("0 of 5 scenarios last to the end");
  });

  it("pins the levers as effects", () => {
    expect(plan().findings.levers).toEqual({
      spend_10pct_less: { base: "runs out at 87", with_change: "lasts to 95", liquid_at_end_change: 192_712, money_runs_out_at_age: null, end_age: 95 },
      retire_2_years_later: { base: "runs out at 87", with_change: "lasts to 95", liquid_at_end_change: 137_392, money_runs_out_at_age: null, end_age: 95 },
      pension_plus_2pct: { base: "runs out at 87", with_change: "runs out at 87", liquid_at_end_change: 10_533, money_runs_out_at_age: 87, end_age: 95 },
    });
  });

  it("pins the year-by-year projection", () => {
    const rows = project(EXAMPLE as Parameters<typeof project>[0]).rows;
    expect(rows[0]).toEqual({ age: 50, phase: "working", income_net: 49_127, spending: 30_000, housing: 25_459, from_pension: 0, pension_pot: 68_024, savings: 75_034 });
    expect(rows[17]).toEqual({ age: 67, phase: "retired", income_net: 30_000, spending: 30_000, housing: 0, from_pension: 21_810, pension_pot: 147_103, savings: 169_092 });
    expect(rows[30]).toMatchObject({ age: 80, pension_pot: 0, savings: 103_309 });
  });

  it("always runs all five scenarios and the fixed footer", () => {
    const p = plan();
    expect(Object.keys(p.findings.scenarios)).toEqual(Object.keys(SCENARIOS));
    expect(p.required_footer).toMatch(/not financial advice/);
    expect(p.flags[0]).toMatch(/exceed take-home pay by £6,332/);
  });

  it("never words a finding as advice", () => {
    const text = JSON.stringify(plan()).toLowerCase();
    for (const banned of ["you should", "we recommend", "you must", "best option"]) expect(text).not.toContain(banned);
  });
});

describe("share link", () => {
  it("round-trips a fact-find", () => {
    expect(decodePlan(encodePlan(EXAMPLE))).toEqual(EXAMPLE);
  });
  it("clamps and drops what a link shouldn't carry", () => {
    const p = encodePlan({ ...EXAMPLE, age: 500, return_pct: 99 } as FactFind);
    const d = decodePlan(p)!;
    expect(d.age).toBe(100);
    expect(d.return_pct).toBe(30);
    expect(decodePlan("not-base64!!")).toBeNull();
  });
});
