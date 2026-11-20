import { describe, expect, it } from "vitest";
import { takeHomePay } from "@/lib/calculators";

// A reader expected take-home to fall as the pension rises and thought it
// didn't (2026-11-20). The maths was right — the page was in "take-home
// target" mode, where take-home is fixed and the salary needed moves — but
// pin the property itself so a rate change can't break it unnoticed.
describe("take-home and the pension", () => {
  it("never rises when the employee pension rises, in any region, method or loan", () => {
    for (const region of ["england_wales_ni", "scotland"] as const)
      for (const pensionMethod of ["salary_sacrifice", "net_pay", "relief_at_source"] as const)
        for (const studentLoan of [null, "plan1", "plan2", "plan4", "plan5"] as const)
          for (let grossSalary = 5_000; grossSalary <= 300_000; grossSalary += 5_000) {
            let prev = Infinity;
            for (let pensionPct = 0; pensionPct <= 40; pensionPct += 2) {
              const { takeHome } = takeHomePay({ grossSalary, region, pensionPct, pensionMethod, studentLoan, postgradLoan: true });
              expect(takeHome).toBeLessThanOrEqual(prev);
              prev = takeHome;
            }
          }
  });

  it("falls by less than the contribution, because of the tax relief", () => {
    const base = takeHomePay({ grossSalary: 45_000 }).takeHome;
    const withPension = takeHomePay({ grossSalary: 45_000, pensionPct: 10, pensionMethod: "salary_sacrifice" }).takeHome;
    // £4,500 into the pension costs £4,500 × (1 − 20% tax − 8% NI) = £3,240 of take-home.
    expect(base - withPension).toBeCloseTo(3_240, 2);
  });
});
