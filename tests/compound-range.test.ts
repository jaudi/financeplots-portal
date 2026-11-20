import { describe, expect, it } from "vitest";
import { compoundGrowth, compoundRange, RANGE_SPREAD_PCT } from "@/lib/calculators";

describe("compoundRange", () => {
  it("is the same plan at the chosen rate ∓ 2 points, year by year", () => {
    const r = compoundRange(10_000, 500, 20, 8);
    expect(RANGE_SPREAD_PCT).toBe(2);
    expect([r.lowRate, r.highRate]).toEqual([6, 10]);
    expect(r.low).toEqual(compoundGrowth(10_000, 500, 20, 6).rows.map((x) => x.portfolioValue));
    expect(r.high).toEqual(compoundGrowth(10_000, 500, 20, 10).rows.map((x) => x.portfolioValue));
    expect(r.low).toHaveLength(20);
    expect(r.lowFinal).toBe(r.low.at(-1));
    expect(r.highFinal).toBe(r.high.at(-1));
  });

  it("brackets the projection in every year", () => {
    const mid = compoundGrowth(10_000, 500, 30, 8).rows;
    const r = compoundRange(10_000, 500, 30, 8);
    mid.forEach((row, i) => {
      expect(r.low[i]).toBeLessThan(row.portfolioValue);
      expect(r.high[i]).toBeGreaterThan(row.portfolioValue);
    });
  });

  it("never goes below 0%: at 0% nothing grows, only the money paid in", () => {
    const r = compoundRange(1_000, 100, 2, 1);
    expect(r.lowRate).toBe(0);
    expect(r.lowFinal).toBe(1_000 + 100 * 24);
    // 1 year at 12% a year, monthly compounding: 10,000 × 1.01^12 = 11,268.25.
    expect(compoundRange(10_000, 0, 1, 10).high).toEqual([11_268]);
  });
});
