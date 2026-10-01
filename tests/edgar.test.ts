import { describe, expect, it } from "vitest";
import { annualValues, buildHistory, mergeTags, type SecFact } from "@/lib/edgar";

// The SEC data is parsed by pure functions, tested here on hand-made facts
// shaped like data.sec.gov's companyconcept responses. No network.

const fy = (end: string, val: number, filed: string, start?: string, form = "10-K"): SecFact => ({ start, end, val, form, fp: "FY", filed });

describe("annualValues", () => {
  it("keeps full-year flows from annual reports, latest filing winning", () => {
    const m = annualValues(
      [
        fy("2025-09-27", 416, "2025-10-31", "2024-09-29"),
        fy("2024-09-28", 391, "2024-11-01", "2023-10-01"),
        fy("2024-09-28", 390, "2025-10-31", "2023-10-01"), // restated in the next 10-K
        fy("2025-06-28", 94, "2025-08-01", "2025-03-30", "10-Q"), // quarter: ignored
        { ...fy("2025-09-27", 102, "2025-10-31", "2025-06-29"), fp: "FY" }, // 3 months inside a 10-K: ignored
      ],
      "flow",
    );
    expect([...m]).toEqual([["2025-09-27", 416], ["2024-09-28", 390]]);
  });

  it("takes balances only as instants (no start date)", () => {
    const m = annualValues([fy("2025-09-27", 36, "2025-10-31"), fy("2025-09-27", 99, "2025-10-31", "2024-09-29")], "instant");
    expect([...m]).toEqual([["2025-09-27", 36]]);
  });
});

describe("mergeTags", () => {
  it("prefers the first tag, falling back year by year (companies switch tags)", () => {
    const newer = new Map([["2025-12-31", 10], ["2024-12-31", 9]]);
    const older = new Map([["2024-12-31", 999], ["2017-12-31", 5]]);
    expect([...mergeTags([newer, older])].sort()).toEqual([["2017-12-31", 5], ["2024-12-31", 9], ["2025-12-31", 10]]);
  });
});

describe("buildHistory", () => {
  const ends = ["2021-12-31", "2022-12-31", "2023-12-31", "2024-12-31", "2025-12-31"];
  const series = (vals: (number | null)[], shiftDays = 0) =>
    new Map(ends.flatMap((e, i) => (vals[i] === null ? [] : [[new Date(Date.parse(e) + shiftDays * 86_400_000).toISOString().slice(0, 10), vals[i]!] as [string, number]])));

  it("works out free cash flow and matches balance dates a few days apart", () => {
    const h = buildHistory("0000000001", {
      revenue: series([1, 2, 3, 4, 5]),
      netIncome: series([1, 1, 1, 1, 1]),
      operatingCashFlow: series([10, 10, 10, 10, 12]),
      capex: series([2, 2, 2, 2, 3]),
      cash: series([5, 5, 5, 5, 6], 2), // 52/53-week year: two days later
      debt: series([7, 7, 7, 7, 8]),
    })!;
    expect(h.years.at(-1)).toMatchObject({ end: "2025-12-31", freeCashFlow: 9, cash: 6, debt: 8 });
    expect(h.available).toEqual({ revenue: true, netIncome: true, cashFlow: true, balance: true });
  });

  it("leaves out a series the company stopped reporting (a bank's old debt tag)", () => {
    const h = buildHistory("0000000002", {
      revenue: series([1, 2, 3, 4, 5]),
      netIncome: series([1, 1, 1, 1, 1]),
      operatingCashFlow: series([1, 1, 1, 1, 1]),
      capex: new Map(),
      cash: series([5, 5, 5, 5, 5]),
      debt: new Map([["2013-12-31", 268], ["2012-12-31", 250]]),
    })!;
    expect(h.available).toEqual({ revenue: true, netIncome: true, cashFlow: false, balance: false });
  });

  it("needs at least two years", () => {
    const one = new Map([["2025-12-31", 1]]);
    expect(buildHistory("0000000003", { revenue: one, netIncome: one, operatingCashFlow: one, capex: one, cash: one, debt: one })).toBeNull();
  });
});
