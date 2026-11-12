import { describe, expect, it } from "vitest";
import { buildSchedule, overpaymentPlan, payoffWithExtra } from "@/lib/calculators";

// £200,000 at 5% over 25 years: £1,169.18 a month.
const RATE = 0.05;
const YEARS = 25;
const AMOUNT = 200_000;

describe("overpaymentPlan", () => {
  it("without overpaying it is the ordinary schedule", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 0);
    const s = buildSchedule(RATE, YEARS, AMOUNT);
    expect(p.months).toBe(300);
    expect(p.monthsSaved).toBe(0);
    expect(p.totalOverpaid).toBe(0);
    expect(p.interestSaved).toBeCloseTo(0, 6);
    expect(p.totalInterest).toBeCloseTo(s.reduce((a, r) => a + r.interest, 0), 6);
    for (const [i, row] of p.rows.entries()) {
      expect(row.balance).toBeCloseTo(s[i].balance, 6);
      expect(row.baseline).toBeCloseTo(s[i].balance, 6);
    }
  });

  it("a regular overpayment matches the closed form n = −ln(1 − rB/P) / ln(1 + r)", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 200);
    const i = RATE / 12;
    const n = Math.ceil(-Math.log(1 - (i * AMOUNT) / (p.monthlyPayment + 200)) / Math.log(1 + i));
    expect(p.months).toBe(n);
    expect(p.monthsSaved).toBe(300 - n);
    expect(p.interestSaved).toBeCloseTo(p.baselineInterest - p.totalInterest, 6);
    // payoffWithExtra (the MCP's original helper) now runs on the same loop.
    expect(payoffWithExtra(RATE, YEARS, AMOUNT, 200)).toEqual({ months: p.months, totalInterest: p.totalInterest });
  });

  it("a lump sum comes off the balance in the month it is paid", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 0, [{ year: 2, month: 1, amount: 10_000 }]);
    const s = buildSchedule(RATE, YEARS, AMOUNT);
    expect(p.rows[11].balance).toBeCloseTo(s[11].balance, 6); // untouched before it
    expect(p.rows[12].overpaid).toBe(10_000);
    expect(p.rows[12].balance).toBeCloseTo(s[12].balance - 10_000, 6);
    expect(p.totalOverpaid).toBe(10_000);
    expect(p.interestSaved).toBeGreaterThan(0);
    expect(p.months).toBeLessThan(300);
  });

  it("never overpays more than is owed, and stops there", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 0, [{ year: 3, month: 6, amount: 1_000_000 }]);
    const s = buildSchedule(RATE, YEARS, AMOUNT);
    const period = 2 * 12 + 6;
    expect(p.months).toBe(period);
    expect(p.totalOverpaid).toBeCloseTo(s[period - 1].balance, 6);
    expect(p.rows[period - 1].balance).toBe(0);
    expect(p.rows.slice(period).every((m) => m.overpaid === 0 && m.interest === 0)).toBe(true);
  });

  it("measures each year's overpayment against the balance at the start of that year", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 500, [{ year: 1, month: 12, amount: 20_000 }]);
    expect(p.yearly[0].openingBalance).toBe(AMOUNT);
    expect(p.yearly[0].overpaid).toBeCloseTo(26_000, 6);
    expect(p.yearly[0].shareOfOpening).toBeCloseTo(0.13, 9);
    expect(p.yearly[1].openingBalance).toBeCloseTo(p.yearly[0].closingBalance, 9);
    expect(p.yearly[1].shareOfOpening).toBeCloseTo(6_000 / p.yearly[1].openingBalance, 9);
  });

  it("ignores lump sums outside the term or of no amount", () => {
    const p = overpaymentPlan(RATE, YEARS, AMOUNT, 0, [
      { year: 26, month: 1, amount: 5_000 },
      { year: 0, month: 6, amount: 5_000 },
      { year: 3, month: 3, amount: 0 },
    ]);
    expect(p.totalOverpaid).toBe(0);
    expect(p.months).toBe(300);
  });
});
