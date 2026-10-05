import { describe, expect, it } from "vitest";
import { DEFAULT_SCHEDULES, fillAll, fillWeeks, forecast, paymentWeeks, summarise, LINES } from "@/lib/cash-flow";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

describe("13-week cash flow", () => {
  it("places payments by frequency within the 13 weeks", () => {
    expect(paymentWeeks("weekly", 1)).toHaveLength(13);
    expect(paymentWeeks("fortnightly", 2)).toEqual([2, 4, 6, 8, 10, 12]);
    // Monthly is every 52/12 weeks, rounded.
    expect(paymentWeeks("monthly", 1)).toEqual([1, 5, 10]);
    expect(paymentWeeks("monthly", 4)).toEqual([4, 8, 13]);
    expect(paymentWeeks("once", 7)).toEqual([7]);
    // Out-of-range first weeks are pulled into 1–13.
    expect(paymentWeeks("once", 0)).toEqual([1]);
    expect(paymentWeeks("once", 20)).toEqual([13]);
  });

  it("compounds growth from week 1 and never goes negative", () => {
    const w = fillWeeks({ amount: 1000, frequency: "weekly", firstWeek: 1, growthPct: 10 });
    expect(w[0]).toBe(1000);
    expect(w[1]).toBe(1100);
    expect(w[2]).toBe(1210);
    expect(fillWeeks({ amount: -500, frequency: "weekly", firstWeek: 1 }).every(x => x === 0)).toBe(true);
  });

  it("rolls the balance forward: opening + in − out = closing, week to week", () => {
    const lines = fillAll(DEFAULT_SCHEDULES);
    const rows = forecast(50000, lines);
    expect(rows).toHaveLength(13);
    rows.forEach((r, i) => {
      expect(r.closing).toBe(r.opening + r.inflows - r.outflows);
      if (i > 0) expect(r.opening).toBe(rows[i - 1].closing);
    });
    expect(rows[0].opening).toBe(50000);
    // Week 4 of the default: revenue 19k + other 2k in; suppliers 16k + payroll 30k out.
    expect(rows[3].inflows).toBe(21000);
    expect(rows[3].outflows).toBe(46000);
  });

  it("summarises totals by line and the lowest week", () => {
    const rows = forecast(50000, fillAll(DEFAULT_SCHEDULES));
    const s = summarise(50000, rows);
    expect(s.totals.revenue).toBe(19000 * 13);
    expect(s.totals.payroll).toBe(30000 * 3);
    expect(s.totals.suppliers).toBe(16000 * 6);
    expect(s.totalIn - s.totalOut).toBe(s.closing - 50000);
    expect(s.lowest).toBe(Math.min(...rows.map(r => r.closing)));
    expect(rows[s.lowestWeek - 1].closing).toBe(s.lowest);
  });

  it("counts weeks below zero", () => {
    const lines = fillAll(DEFAULT_SCHEDULES);
    lines.taxes = lines.taxes.map((_, i) => (i === 0 ? 200000 : 0));
    const rows = forecast(0, lines);
    const s = summarise(0, rows);
    expect(rows[0].closing).toBeLessThan(0);
    expect(s.weeksNegative).toBe(rows.filter(r => r.closing < 0).length);
    // The lowest week is the first time the balance hits its minimum.
    expect(s.lowestWeek).toBe(rows.findIndex(r => r.closing === s.lowest) + 1);
  });

  it("has a name and a hint for every line in both languages", () => {
    for (const l of LINES) {
      expect(en.cashFlow.lines[l]).toBeTruthy();
      expect(es.cashFlow.lines[l]).toBeTruthy();
      expect(en.cashFlow.hints[l]).toBeTruthy();
      expect(es.cashFlow.hints[l]).toBeTruthy();
    }
    const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v).map(s => `${k}.${s}`) : [k])).sort();
    expect(keys(es.cashFlow)).toEqual(keys(en.cashFlow));
  });
});
