import { describe, expect, it } from "vitest";
import { buildSchedule, monthlyPayment, overpaymentPlan } from "@/lib/calculators";
import {
  GRID_RATES_PCT,
  GRID_YEARS,
  HEADLINE_RATE_PCT,
  HEADLINE_YEARS,
  MORTGAGE_PAGES,
  mortgagePage,
  mortgagePath,
  mortgageSlug,
  parseMortgageSlug,
  yearsMonths,
} from "@/lib/mortgage-pages";

describe("mortgage amount pages", () => {
  it("lists 101 distinct amounts in ascending order, £50k to £1m", () => {
    expect(MORTGAGE_PAGES).toHaveLength(101);
    expect(new Set(MORTGAGE_PAGES).size).toBe(101);
    expect([...MORTGAGE_PAGES].sort((a, b) => a - b)).toEqual(MORTGAGE_PAGES);
    expect(MORTGAGE_PAGES[0]).toBe(50_000);
    expect(MORTGAGE_PAGES).toContain(125_000);
    expect(MORTGAGE_PAGES.at(-1)).toBe(1_000_000);
  });

  it("round-trips every slug and rejects anything off the list", () => {
    for (const a of MORTGAGE_PAGES) expect(parseMortgageSlug(mortgageSlug(a))).toBe(a);
    expect(mortgagePath(200_000)).toBe("/tools/lending/200000-mortgage");
    for (const bad of ["201000-mortgage", "200000", "0200000-mortgage", "45000-mortgage", "abc-mortgage", "200000-mortgage-x"]) {
      expect(parseMortgageSlug(bad)).toBeNull();
    }
  });

  it("matches the Lending Calculator's maths (£200,000 worked by hand)", () => {
    const p = mortgagePage(200_000);
    // r = 0.375% a month, n = 300: 750 / (1 − 1.00375^−300) ≈ £1,111.66.
    expect(p.monthly).toBeCloseTo(1_111.66, 1);
    expect(p.totalInterest).toBeCloseTo(1_111.66 * 300 - 200_000, -1);
    expect(p.interestOnly[GRID_RATES_PCT.indexOf(4.5)]).toBe(750);
    expect(p.firstPaymentInterestShare).toBeCloseTo(750 / p.monthly, 10);
    expect(p.incomeRange[0]).toBeCloseTo(44_444.44, 1);
    expect(p.incomeRange[1]).toBe(50_000);

    const schedule = buildSchedule(HEADLINE_RATE_PCT / 100, HEADLINE_YEARS, 200_000);
    expect(p.balanceAfter2).toBe(schedule[23].balance);
    expect(p.balanceAfter5).toBe(schedule[59].balance);
    expect(p.balanceAfter5).toBeLessThan(p.balanceAfter2);
    expect(p.overpaying[0].interestSaved).toBe(overpaymentPlan(0.045, 25, 200_000, 100).interestSaved);

    for (const a of [50_000, 325_000, 1_000_000]) {
      const q = mortgagePage(a);
      GRID_RATES_PCT.forEach((r, ri) => GRID_YEARS.forEach((y, yi) => expect(q.grid[ri][yi]).toBe(monthlyPayment(r / 100, y, a))));
      expect(q.onePointMore).toBeGreaterThan(0);
      expect(q.overpaying[1].monthsSaved).toBeGreaterThan(q.overpaying[0].monthsSaved);
    }
  });

  it("links neighbours without leaving the list", () => {
    expect(mortgagePage(50_000).prev).toBeNull();
    expect(mortgagePage(500_000).next).toBe(550_000);
    expect(mortgagePage(1_000_000).next).toBeNull();
    for (const a of MORTGAGE_PAGES) {
      const p = mortgagePage(a);
      expect(p.nearby).not.toContain(a);
      expect(p.nearby.every((n) => MORTGAGE_PAGES.includes(n))).toBe(true);
    }
  });

  it("writes durations in words", () => {
    expect(yearsMonths(40)).toBe("3 years 4 months");
    expect(yearsMonths(11)).toBe("11 months");
    expect(yearsMonths(24)).toBe("2 years");
    expect(yearsMonths(13)).toBe("1 year 1 month");
  });
});
