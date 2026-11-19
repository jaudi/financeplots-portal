import { describe, expect, it } from "vitest";
import { takeHomePay } from "@/lib/calculators";
import { parseSalarySlug, SALARY_PAGES, salaryPage, salaryPath, salarySlug } from "@/lib/salary-pages";

describe("salary after tax pages", () => {
  it("lists 98 distinct salaries in ascending order, £15k to £200k", () => {
    expect(SALARY_PAGES).toHaveLength(98);
    expect(new Set(SALARY_PAGES).size).toBe(98);
    expect([...SALARY_PAGES].sort((a, b) => a - b)).toEqual(SALARY_PAGES);
    expect(SALARY_PAGES[0]).toBe(15_000);
    expect(SALARY_PAGES.at(-1)).toBe(200_000);
  });

  it("round-trips every slug and rejects anything off the list", () => {
    for (const s of SALARY_PAGES) expect(parseSalarySlug(salarySlug(s))).toBe(s);
    expect(salaryPath(45_000)).toBe("/tools/take-home-pay/45000-after-tax");
    for (const bad of ["45001-after-tax", "45000", "045000-after-tax", "1000000-after-tax", "abc-after-tax", "45000-after-tax-x"]) {
      expect(parseSalarySlug(bad)).toBeNull();
    }
  });

  it("uses the calculator's figures (worked by hand for £45,000 and £110,000)", () => {
    const p45 = salaryPage(45_000);
    // Tax: (45,000 − 12,570) × 20% = 6,486. NI: 32,430 × 8% = 2,594.40.
    expect(p45.base.incomeTax).toBe(6_486);
    expect(p45.base.nationalInsurance).toBe(2_594.4);
    expect(p45.base.takeHome).toBe(35_919.6);
    expect(p45.monthly).toBeCloseTo(2_993.3, 1);

    // Allowance 12,570 − 5,000 = 7,570; tax 37,700 × 20% + 64,730 × 40% = 33,432;
    // NI 37,700 × 8% + 59,730 × 2% = 4,210.60.
    const p110 = salaryPage(110_000);
    expect(p110.base.personalAllowance).toBe(7_570);
    expect(p110.base.incomeTax).toBe(33_432);
    expect(p110.base.takeHome).toBe(72_357.4);
    expect(p110.notes[0]).toMatch(/60% band/);

    for (const s of SALARY_PAGES) {
      const p = salaryPage(s);
      expect(p.scenarios[0].result).toEqual(takeHomePay({ grossSalary: s }));
      expect(p.scenarios.find((x) => x.key === "scotland")!.result).toEqual(takeHomePay({ grossSalary: s, region: "scotland" }));
    }
  });

  it("links neighbours without leaving the list", () => {
    const first = salaryPage(15_000);
    expect(first.prev).toBeNull();
    expect(first.next).toBe(16_000);
    const last = salaryPage(200_000);
    expect(last.next).toBeNull();
    expect(last.prev).toBe(175_000);
    expect(salaryPage(100_000).next).toBe(105_000);
    for (const s of SALARY_PAGES) {
      const p = salaryPage(s);
      expect(p.nearby).not.toContain(s);
      expect(p.nearby.every((n) => SALARY_PAGES.includes(n))).toBe(true);
    }
  });

  it("says a student loan costs nothing below its threshold, and only then", () => {
    expect(salaryPage(25_000).notes.join(" ")).toMatch(/Plan 2 student loan costs nothing/);
    expect(salaryPage(25_000).notes.join(" ")).toMatch(/Plan 5 student loan costs nothing/);
    expect(salaryPage(30_000).notes.join(" ")).not.toMatch(/costs nothing/);
  });
});
