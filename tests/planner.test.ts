import { describe, expect, it } from "vitest";
import { allocationAt, debtSchedule, glidePath, growthPath, monthlyPayment, parseAmount } from "@/lib/planner";

describe("debt schedule", () => {
  it("charges a 25-year £200k mortgage at 4.5% the standard repayment interest", () => {
    // £1,111.66 a month for 300 months, less the £200,000 borrowed.
    expect(monthlyPayment(200_000, 4.5, 25)).toBeCloseTo(1111.66, 1);
    const s = debtSchedule([{ key: "mortgage", balance: 200_000, rate: 4.5, term: 25 }]);
    expect(s.totalInterest).toBeCloseTo(1111.66 * 300 - 200_000, -2);
    expect(s.rows[0].mortgage).toBe(200_000);
    expect(s.rows[25].mortgage).toBe(0);
    expect(s.debtFreeYears).toBe(25);
  });

  it("is debt-free today with no debts, and ignores zero balances", () => {
    const s = debtSchedule([{ key: "car", balance: 0, rate: 7, term: 5 }]);
    expect(s.debtFreeYears).toBe(0);
    expect(s.totalInterest).toBe(0);
  });

  it("repays shorter debts first in the yearly balances", () => {
    const s = debtSchedule([
      { key: "car", balance: 15_000, rate: 7, term: 5 },
      { key: "mortgage", balance: 100_000, rate: 4, term: 20 },
    ]);
    expect(s.rows[5].car).toBe(0);
    expect(s.rows[5].mortgage).toBeGreaterThan(0);
    expect(s.debtFreeYears).toBe(20);
  });
});

describe("growth path", () => {
  it("compounds monthly and brackets the result between lower and higher returns", () => {
    const { rows } = growthPath(500, 7, 30);
    const last = rows.at(-1)!;
    expect(last.contributions).toBe(180_000);
    expect(last.value).toBe(last.contributions + last.interest);
    expect(last.low).toBeLessThan(last.value);
    expect(last.high).toBeGreaterThan(last.value);
  });

  it("finds the year growth first beats a year's contributions", () => {
    // At 8%, a year's growth passes a year's saving after roughly nine years.
    const { crossover } = growthPath(1000, 8, 30);
    expect(crossover).toBeGreaterThanOrEqual(8);
    expect(crossover).toBeLessThanOrEqual(10);
    expect(growthPath(1000, 0, 30).crossover).toBeNull();
  });
});

describe("model allocation", () => {
  it("always sums to 100 and moves from shares to bonds with age", () => {
    for (const risk of ["conservative", "moderate", "aggressive"] as const) {
      for (const age of [20, 35, 50, 67, 80]) {
        const a = allocationAt(risk, age);
        expect(a.stocks + a.bonds + a.cash + a.alternatives).toBe(100);
      }
    }
    expect(allocationAt("moderate", 60).stocks).toBeLessThan(allocationAt("moderate", 35).stocks);
  });

  it("runs from today's age to retirement", () => {
    const g = glidePath("moderate", 35);
    expect(g[0].age).toBe(35);
    expect(g.at(-1)!.age).toBe(67);
  });
});

describe("chat answers", () => {
  it.each([
    ["4000", 4000], ["£4,000", 4000], ["4.000", 4000], ["4.000 €", 4000], ["3,5", 3.5], ["7.5", 7.5],
    ["1,250,000", 1_250_000], ["1.250.000,50", 1_250_000.5], ["4k", 4000], ["2 mil", 2000],
    ["1.5 million", 1_500_000], ["cuatro mil", 4000], ["none", 0], ["nada", 0], ["0", 0], ["35 years", 35],
  ])("%s → %d", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it("returns null when there is no amount", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("not sure")).toBeNull();
    // "no" alone is zero, but not when it is part of "I don't know".
    expect(parseAmount("no se")).toBeNull();
    expect(parseAmount("no lo sé")).toBeNull();
    expect(parseAmount("no tengo")).toBe(0);
    expect(parseAmount("I have none")).toBe(0);
  });
});
