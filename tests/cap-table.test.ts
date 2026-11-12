import { describe, expect, it } from "vitest";
import { capTable, checkScenario, exampleScenario, type Scenario } from "@/lib/cap-table";

// The worked example in @1984vc/cap-table's README (two founders, issued
// options, a 750k pool, five SAFEs, a $4M round at $25M pre, pool refreshed to
// 10%). Its published result pins the whole pipeline: our mapping of the
// page's boxes onto the library, and the library itself.
const README: Scenario = {
  holders: [
    { name: "Founder A", shares: 4_500_000 },
    { name: "Founder B", shares: 4_500_000 },
    { name: "Issued Options", shares: 250_000 },
  ],
  unusedPool: 750_000,
  safes: [
    { name: "YC 7%", investment: 125_000, cap: 0, discountPct: 0, kind: "yc7p" },
    { name: "YC MFN", investment: 375_000, cap: 0, discountPct: 0, kind: "mfn" },
    { name: "1984 Ventures", investment: 750_000, cap: 10_000_000, discountPct: 0, kind: "post" },
    { name: "Benchmark", investment: 475_000, cap: 10_000_000, discountPct: 0, kind: "post" },
    { name: "Follow-on SAFE", investment: 500_000, cap: 13_000_000, discountPct: 0, kind: "post" },
  ],
  roundOn: true,
  preMoney: 25_000_000,
  investors: [{ name: "Series A Lead", investment: 4_000_000 }],
  targetPoolPct: 10,
};

describe("capTable — priced round", () => {
  const r = capTable(README);
  if (!r.ok) throw new Error(JSON.stringify(r.error));

  it("matches the library's published example", () => {
    expect(r.mode).toBe("round");
    expect(r.pps).toBe(1.71056);
    expect(r.totalAfter).toBe(16_953_545);
    const shares = Object.fromEntries(r.rows.map((x) => [x.kind === "pool" ? "Pool" : x.name, x.sharesAfter]));
    expect(shares).toEqual({
      "Founder A": 4_500_000,
      "Founder B": 4_500_000,
      "Issued Options": 250_000,
      "YC 7%": 956_884,
      "YC MFN": 512_610,
      "1984 Ventures": 1_025_220,
      Benchmark: 649_306,
      "Follow-on SAFE": 525_756,
      "Series A Lead": 2_338_415,
      Pool: 1_695_354,
    });
    expect(r.additionalOptions).toBe(945_354);
  });

  it("reconciles: rows add up to the total and to 100%", () => {
    expect(r.rows.reduce((a, x) => a + (x.sharesAfter ?? 0), 0)).toBe(r.totalAfter);
    expect(r.rows.reduce((a, x) => a + (x.pctAfter ?? 0), 0)).toBeCloseTo(1, 9);
    expect(r.rows.reduce((a, x) => a + x.pctBefore, 0)).toBeCloseTo(1, 9);
  });

  it("shows today's shareholders before and after", () => {
    expect(r.totalBefore).toBe(10_000_000);
    expect(r.holdersBefore).toBeCloseTo(0.925, 9); // 9.25M of 10M; the unused pool is the rest
    expect(r.holdersAfter).toBeCloseTo((9_250_000) / 16_953_545, 9);
  });
});

describe("capTable — other modes", () => {
  it("today only: shares in, ownership out", () => {
    const r = capTable({ ...README, safes: [], roundOn: false });
    if (!r.ok) throw new Error();
    expect(r.mode).toBe("today");
    expect(r.rows.find((x) => x.name === "Founder A")?.pctBefore).toBeCloseTo(0.45, 9);
  });

  it("SAFEs without a round: capped post-money SAFEs are estimated", () => {
    const r = capTable({ ...README, safes: README.safes.slice(2), roundOn: false });
    if (!r.ok) throw new Error(JSON.stringify(r.error));
    expect(r.mode).toBe("estimate");
    const safe = r.rows.find((x) => x.name === "1984 Ventures");
    expect(safe?.pctAfter).toBeCloseTo(0.075, 3); // 750k / 10M post-money cap
    expect(r.rows.reduce((a, x) => a + (x.pctAfter ?? 0), 0)).toBeCloseTo(1, 6);
  });

  it("an uncapped SAFE without a round leaves the outcome unknown, not invented", () => {
    const r = capTable({ ...README, safes: [{ name: "Uncapped", investment: 100_000, cap: 0, discountPct: 20, kind: "post" }], roundOn: false });
    if (!r.ok) throw new Error(JSON.stringify(r.error));
    expect(r.totalAfter).toBeUndefined();
    expect(r.rows.filter((x) => x.kind !== "pool").every((x) => x.pctAfter === undefined)).toBe(true);
  });

  it("leaves out empty lines", () => {
    const r = capTable({ ...README, holders: [...README.holders, { name: "", shares: 0 }], investors: [...README.investors, { name: "", investment: 0 }] });
    if (!r.ok) throw new Error();
    expect(r.rows.filter((x) => x.kind === "holder")).toHaveLength(3);
    expect(r.rows.filter((x) => x.kind === "series")).toHaveLength(1);
  });

  it("the page's example works", () => {
    const r = capTable(exampleScenario());
    expect(r.ok).toBe(true);
  });
});

describe("checkScenario — says what to fix", () => {
  it("needs a shareholder", () => {
    expect(checkScenario({ ...README, holders: [{ name: "x", shares: 0 }] })).toEqual({ key: "noHolders" });
  });
  it("a SAFE's amount must be below its cap", () => {
    const safes = [{ name: "Big", investment: 2_000_000, cap: 1_000_000, discountPct: 0, kind: "post" as const }];
    expect(checkScenario({ ...README, safes })).toEqual({ key: "safeCap", name: "Big" });
  });
  it("post-money SAFEs can't own 100% between them", () => {
    const safes = [0, 1].map(() => ({ name: "", investment: 600_000, cap: 1_000_000, discountPct: 0, kind: "post" as const }));
    expect(checkScenario({ ...README, safes })).toEqual({ key: "safesTooBig" });
  });
  it("a round needs a valuation and money", () => {
    expect(checkScenario({ ...README, preMoney: 0 })).toEqual({ key: "roundIncomplete" });
    expect(checkScenario({ ...README, investors: [{ name: "", investment: 0 }] })).toEqual({ key: "roundIncomplete" });
  });
});
