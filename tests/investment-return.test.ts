import { describe, expect, it } from "vitest";
import {
  checkFlows,
  decodeFlows,
  encodeFlows,
  investmentReturn,
  netInvestedSteps,
  parseAmount,
  parseDate,
  parseFlowsText,
  rangeFor,
  replayFlows,
  xirr,
  type ClosePoint,
} from "@/lib/investment-return";

// XIRR figures are Excel's, or worked independently by bisection on the same
// 365-day formula — if one moves, the maths changed.

describe("xirr", () => {
  it("matches Excel's documented example: 37.34%", () => {
    const r = xirr([
      { date: "2008-01-01", amount: -10000 },
      { date: "2008-03-01", amount: 2750 },
      { date: "2008-10-30", amount: 4250 },
      { date: "2009-02-15", amount: 3250 },
      { date: "2009-04-01", amount: 2750 },
    ]);
    expect(r).toBeCloseTo(0.373362535, 8);
  });

  it("is exactly 10% for +10% over 365 days, and counts a leap year's extra day", () => {
    expect(xirr([{ date: "2023-01-01", amount: -1000 }, { date: "2024-01-01", amount: 1100 }])).toBeCloseTo(0.1, 10);
    expect(xirr([{ date: "2024-01-01", amount: -1000 }, { date: "2025-01-01", amount: 1100 }])).toBeCloseTo(1.1 ** (365 / 366) - 1, 10);
  });

  it("handles losses and order-independent input", () => {
    const r = xirr([{ date: "2021-06-01", amount: 600 }, { date: "2020-06-01", amount: -1000 }]);
    expect(r).toBeCloseTo(-0.4, 3);
  });

  it("is null without money both ways", () => {
    expect(xirr([{ date: "2020-01-01", amount: -1000 }])).toBeNull();
    expect(xirr([{ date: "2020-01-01", amount: 1000 }, { date: "2021-01-01", amount: 5 }])).toBeNull();
  });

  it("finds very large returns that Newton from 10% overshoots", () => {
    const r = xirr([{ date: "2025-01-01", amount: -100 }, { date: "2025-02-01", amount: 300 }]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(3 ** (365 / 31) - 1, -2);
  });
});

describe("investmentReturn", () => {
  it("separates the simple return from the annual one when money went in late", () => {
    const r = investmentReturn(
      [{ date: "2020-01-01", amount: 1000 }, { date: "2025-01-01", amount: 9000 }],
      11000,
      "2026-01-01",
    );
    expect(r.totalIn).toBe(10000);
    expect(r.gain).toBe(1000);
    expect(r.simpleReturnPct).toBeCloseTo(10, 10);
    expect(r.multiple).toBeCloseTo(1.1, 10);
    expect(r.annualReturnPct!).toBeCloseTo(6.240140325, 6);
    expect(r.shortPeriod).toBe(false);
  });

  it("counts withdrawals as money back", () => {
    const r = investmentReturn(
      [{ date: "2023-01-01", amount: 1000 }, { date: "2023-07-02", amount: -500 }],
      600,
      "2024-01-01",
    );
    expect(r.totalOut).toBe(500);
    expect(r.gain).toBe(100);
    expect(r.multiple).toBeCloseTo(1.1, 10);
  });

  it("is −100% when everything was lost and nothing taken out", () => {
    expect(investmentReturn([{ date: "2023-01-01", amount: 1000 }], 0, "2024-01-01").annualReturnPct).toBe(-100);
  });

  it("flags periods under a year", () => {
    expect(investmentReturn([{ date: "2026-03-01", amount: 1000 }], 1050, "2026-09-01").shortPeriod).toBe(true);
  });
});

describe("checkFlows", () => {
  const ok = [{ date: "2024-01-10", amount: 1000 }];
  it("accepts valid inputs", () => expect(checkFlows(ok, 1200, "2026-10-01")).toBeNull());
  it.each([
    [[], 100, "2026-10-01", "no_flows"],
    [[{ date: "2024-02-30", amount: 1000 }], 100, "2026-10-01", "bad_date"],
    [ok, -1, "2026-10-01", "bad_value"],
    [[{ date: "2027-01-01", amount: 1000 }], 100, "2026-10-01", "after_value_date"],
    [[{ date: "2024-01-01", amount: -1000 }], 100, "2026-10-01", "no_money_in"],
  ] as const)("rejects %j", (flows, value, date, problem) => {
    expect(checkFlows([...flows], value, date)).toBe(problem);
  });
});

describe("netInvestedSteps", () => {
  it("adds up money in less money out, merging same-day flows", () => {
    expect(
      netInvestedSteps([
        { date: "2024-03-01", amount: -200 },
        { date: "2024-01-01", amount: 1000 },
        { date: "2024-01-01", amount: 500 },
      ]),
    ).toEqual([{ date: "2024-01-01", netIn: 1500 }, { date: "2024-03-01", netIn: 1300 }]);
  });
});

// A price that grows exactly 10% a year, one close a day.
function steady(from: string, days: number, start = 100): ClosePoint[] {
  const out: ClosePoint[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    out.push({ date: d.toISOString().slice(0, 10), close: start * 1.1 ** (i / 365) });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

describe("replayFlows", () => {
  const prices = steady("2020-01-01", 2400);

  it("earns the index's own 10% a year whatever the timing of the money", () => {
    const flows = [
      { date: "2020-03-15", amount: 1000 },
      { date: "2021-07-01", amount: 2500 },
      { date: "2022-02-10", amount: -800 },
      { date: "2023-05-20", amount: 400 },
    ];
    const r = replayFlows(flows, prices, "2025-06-01");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.annualReturnPct!).toBeCloseTo(10, 6);
    expect(r.path.at(-1)!.value).toBeCloseTo(r.value, 6);
    expect(r.path[0].date).toBe("2020-03-15");
  });

  it("buys at the last close before a date with no price (a weekend)", () => {
    const gappy = prices.filter((p) => p.date !== "2021-07-01");
    const r = replayFlows([{ date: "2021-07-01", amount: 1000 }], gappy, "2022-07-01");
    expect(r.ok && r.value).toBeCloseTo((1000 / prices.find((p) => p.date === "2021-06-30")!.close) * prices.find((p) => p.date === "2022-07-01")!.close, 6);
  });

  it("refuses when the price history starts after the first flow", () => {
    expect(replayFlows([{ date: "2019-06-01", amount: 1000 }], prices, "2024-01-01")).toEqual({ ok: false, problem: "history_too_short", date: "2020-01-01" });
  });

  it("refuses when a withdrawal is more than the replayed holding was worth", () => {
    const r = replayFlows([{ date: "2020-01-01", amount: 1000 }, { date: "2020-06-01", amount: -5000 }], prices, "2024-01-01");
    expect(r).toEqual({ ok: false, problem: "withdrawal_too_large", date: "2020-06-01" });
  });
});

describe("rangeFor", () => {
  it("fetches enough history", () => {
    expect(rangeFor("2026-01-01", "2026-10-06")).toBe("1y");
    expect(rangeFor("2023-01-01", "2026-10-06")).toBe("5y");
    expect(rangeFor("2015-01-01", "2026-10-06")).toBe("max");
  });
});

describe("parsing pasted rows", () => {
  it.each([
    ["2024-01-10", "2024-01-10"],
    ["10/01/2024", "2024-01-10"],
    ["1.2.2024", "2024-02-01"],
    ["31-12-25", "2025-12-31"],
    ["45301", "2024-01-10"],
    ["13/13/2024", null],
    ["Date", null],
  ])("date %s → %s", (raw, iso) => expect(parseDate(raw)).toBe(iso));

  it.each([
    ["5000", ".", 5000],
    ["£5,000", ".", 5000],
    ["1,234.56", ".", 1234.56],
    ["1.234,56", ".", 1234.56],
    ["1.500", ",", 1500],
    ["12,5", ",", 12.5],
    ["1,500", ",", 1.5],
    ["1.500", ".", 1.5],
    ["1,234,567", ",", 1234567],
    ["-250", ".", -250],
    ["(250.00)", ".", -250],
    ["€ 3 000", ",", 3000],
    ["abc", ".", null],
  ] as const)("amount %s (decimal %s) → %s", (raw, dec, n) => expect(parseAmount(raw, dec)).toBe(n));

  it("reads tab-separated rows from Excel, skipping headers", () => {
    const text = "Date\tAmount\n10/01/2024\t5,000\n15/03/2025\t-1,500.50\n\nTotal\t3,499.50";
    expect(parseFlowsText(text)).toEqual({
      flows: [{ date: "2024-01-10", amount: 5000 }, { date: "2025-03-15", amount: -1500.5 }],
      skipped: 2,
    });
  });

  it("reads quoted CSV and semicolon CSV with decimal commas", () => {
    expect(parseFlowsText('2024-01-10,"1,234.50"').flows).toEqual([{ date: "2024-01-10", amount: 1234.5 }]);
    expect(parseFlowsText("10/01/2024;1.234,50", ",").flows).toEqual([{ date: "2024-01-10", amount: 1234.5 }]);
    expect(parseFlowsText("2024-01-10 750").flows).toEqual([{ date: "2024-01-10", amount: 750 }]);
  });

  it("round-trips flows through the share link", () => {
    const flows = [{ date: "2022-01-10", amount: 5000 }, { date: "2025-03-15", amount: -1500.25 }];
    expect(decodeFlows(encodeFlows(flows))).toEqual(flows);
    expect(decodeFlows("2022-13-01_5~nonsense~2022-01-01_x")).toEqual([]);
  });
});
