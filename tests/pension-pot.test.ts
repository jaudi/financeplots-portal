import { describe, expect, it } from "vitest";
import { incomeTax } from "@/lib/calculators";
import { minPensionAge, pensionPot, statePension } from "@/lib/pension-pot";

// Figures pinned from the Python reference (reference/planning-tools/pension_pot.py).
// If one moves, the TypeScript port and the reference disagree.

const EXAMPLE = { age: 50, potToday: 60_000, salary: 70_000, employeePct: 5, employerPct: 5, birthYear: 1976 };

describe("incomeTax", () => {
  it("matches take-home pay's tax on £70k with 5% salary sacrifice", () => expect(incomeTax(66_500)).toBe(14_032));
  it("tapers the personal allowance above £100k", () => expect(incomeTax(110_000)).toBe(33_432));
  it("charges no tax on the full State Pension alone", () => expect(incomeTax(12_547.6)).toBe(0));
  it("reaches the additional rate", () => expect(incomeTax(150_000)).toBeCloseTo(53_703, 0));
});

describe("pensionPot", () => {
  it("pins the reference example (retire at 67)", () => {
    const r = pensionPot({ ...EXAMPLE, retireAge: 67, targetIncome: 30_000 });
    expect(r.at_retirement).toEqual({ age: 67, pot: 229_395, pot_nominal: 349_052, paid_in: 123_759, growth: 45_636, tax_free_cash: 57_349, pot_for_income: 172_047 });
    expect(r.state_pension).toEqual({ per_year: 12_548, from_age: 67, bridge_years_before_it: 0 });
    expect(r.sustainable_income).toEqual({ until_age: 95, gross_per_year: 19_531, from_pot_per_year: 6_984, net_per_year: 18_139, net_per_month: 1_512, life_plan_pension_per_year: 18_139 });
    expect(r.target).toEqual({ gross_per_year: 30_000, pot_runs_out_at_age: 77, lasts_to_plan_age: false });
    expect(r.accumulation[0]).toEqual({ age: 51, contributions: 7_000, pot_end: 68_233 });
    expect(r.drawdown[0]).toEqual({ age: 67, state_pension: 12_548, from_pot: 6_984, gross_income: 19_531, tax: 1_392, net_income: 18_139, pot_end: 166_673 });
    expect(r.drawdown.at(-1)).toMatchObject({ age: 94, pot_end: 0 });
  });

  it("pins the reference example (retire at 60, seven bridge years)", () => {
    const r = pensionPot({ ...EXAMPLE, retireAge: 60 });
    expect(r.at_retirement.pot).toBe(151_604);
    expect(r.state_pension.bridge_years_before_it).toBe(7);
    expect(r.sustainable_income.net_per_year).toBe(13_313);
    expect(r.drawdown[0]).toMatchObject({ state_pension: 0 });
  });

  it("splits the pot evenly when real growth is zero", () => {
    const r = pensionPot({ age: 60, potToday: 100_000, retireAge: 67, planToAge: 77, niQualifyingYears: 0, taxFreeCashPct: 0, returnPct: 2.5, returnInRetirementPct: 2.5, feePct: 0, inflationPct: 2.5 });
    expect(r.at_retirement.pot).toBe(100_000);
    expect(r.sustainable_income.gross_per_year).toBeCloseTo(10_000, -1);
    expect(r.drawdown.at(-1)!.pot_end).toBeLessThan(5);
  });

  it("caps tax-free cash at the lump sum allowance", () => {
    expect(pensionPot({ age: 60, potToday: 2_000_000, retireAge: 67 }).at_retirement.tax_free_cash).toBe(268_275);
  });

  it("warns about retiring before the minimum pension age and NI gaps", () => {
    const r = pensionPot({ age: 50, potToday: 100_000, retireAge: 55, birthYear: 1976, niQualifyingYears: 30 });
    expect(r.warnings.join(" ")).toMatch(/before 57/);
    expect(r.warnings.join(" ")).toMatch(/5 NI years short/);
  });

  it("knows the State Pension and minimum pension age rules", () => {
    expect(statePension(35)).toBe(12_547.6);
    expect(statePension(9)).toBe(0);
    expect(minPensionAge(1970)).toBe(55);
    expect(minPensionAge(1976)).toBe(57);
  });

  it("refuses impossible ages", () => {
    expect(() => pensionPot({ age: 70, potToday: 0, retireAge: 67 })).toThrow(RangeError);
  });
});
