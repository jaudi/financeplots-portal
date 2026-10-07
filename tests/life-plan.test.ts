import { describe, expect, it } from "vitest";
import { monthlyPayment } from "@/lib/calculators";
import { cleanPlan, decodeShared, encodeShared, examplePlan, presetEvent, project, todaysMoney, type LifeEvent, type Plan } from "@/lib/life-plan";

// Figures worked by hand: with growth, inflation and returns at zero, each
// year's savings change is just income − costs, so every number can be checked.

const Y = 2026;
const flat = (over: Partial<Plan> = {}): Plan => ({
  savings: 10_000,
  takeHome: 40_000,
  spending: 20_000,
  housing: { kind: "rent", rentMonthly: 1_000 },
  debt: { balance: 0, ratePct: 0, years: 0 },
  payGrowthPct: 0,
  inflationPct: 0,
  returnPct: 0,
  housePricePct: 0,
  withdrawalPct: 0,
  events: [],
  ...over,
});
const ev = <K extends LifeEvent["kind"]>(kind: K, year: number, over: Partial<Extract<LifeEvent, { kind: K }>> = {}) =>
  ({ ...presetEvent(kind, year), ...over }) as LifeEvent;

describe("project — the basics", () => {
  it("adds income less rent and living costs each year", () => {
    const p = project(flat(), Y, 3);
    // 40,000 − 20,000 − 12,000 rent = 8,000 a year
    expect(p.rows.map((r) => r.savings)).toEqual([18_000, 26_000, 34_000]);
    expect(p.start.netWorth).toBe(10_000);
  });

  it("compounds savings at the return, and grows pay and prices", () => {
    const r = project(flat({ takeHome: 0, spending: 0, housing: { kind: "rent", rentMonthly: 0 }, savings: 1_000, returnPct: 10 }), Y, 2).rows;
    expect(r[1].savings).toBeCloseTo(1_210, 9);
    const g = project(flat({ payGrowthPct: 10, inflationPct: 5 }), Y, 2).rows;
    expect(g[1].income).toBeCloseTo(44_000, 9);
    expect(g[1].living).toBeCloseTo(21_000, 9);
    expect(g[1].housing).toBeCloseTo(12_600, 9);
  });

  it("states amounts in today's money", () => {
    expect(todaysMoney({ inflationPct: 2 }, Y, Y + 2)).toBeCloseTo(1.0404, 12);
  });
});

describe("project — events", () => {
  it("buying a home: deposit and costs out, rent stops, mortgage payments start", () => {
    const home = ev("home", Y + 1, { price: 100_000, depositPct: 10, costs: 2_000, ratePct: 0, termYears: 10 });
    const r = project(flat({ events: [home] }), Y, 12).rows;
    // 2027: income 40,000 − living 20,000 − deposit 10,000 − costs 2,000 − mortgage 9,000 = −1,000
    expect(r[1]).toMatchObject({ housing: 9_000, oneOffs: 12_000, homeValue: 100_000, mortgage: 81_000 });
    expect(r[1].savings).toBe(18_000 - 1_000);
    expect(r[1].netWorth).toBe(17_000 + 100_000 - 81_000);
  });

  it("charges interest the way the loan calculator does", () => {
    const home = ev("home", Y, { price: 200_000, depositPct: 0, costs: 0, ratePct: 5, termYears: 25 });
    const r = project(flat({ events: [home] }), Y, 1).rows;
    expect(r[0].housing).toBeCloseTo(monthlyPayment(0.05, 25, 200_000) * 12, 6);
  });

  it("reports when the mortgage, and all debt, is paid off", () => {
    const home = ev("home", Y, { price: 50_000, depositPct: 0, costs: 0, ratePct: 0, termYears: 5 });
    const p = project(flat({ debt: { balance: 6_000, ratePct: 0, years: 6 }, events: [home] }), Y, 10);
    expect(p.milestones).toContainEqual({ kind: "mortgageFree", year: Y + 4 });
    expect(p.milestones).toContainEqual({ kind: "debtFree", year: Y + 5 });
  });

  it("a baby: lower income the first year, childcare for the years set", () => {
    const r = project(flat({ events: [ev("baby", Y, { costPerYear: 6_000, years: 2, incomeDropPct: 50 })] }), Y, 3).rows;
    expect(r.map((x) => x.income)).toEqual([20_000, 40_000, 40_000]);
    expect(r.map((x) => x.living)).toEqual([26_000, 26_000, 20_000]);
  });

  it("a career break for one year, then a permanent pay rise", () => {
    const events = [ev("income", Y + 1, { changePct: -100, years: 1 }), ev("income", Y + 2, { changePct: 25, years: 0 })];
    expect(project(flat({ events }), Y, 4).rows.map((r) => r.income)).toEqual([40_000, 0, 50_000, 50_000]);
  });

  it("retirement replaces pay with the pension, in today's money", () => {
    const r = project(flat({ inflationPct: 10, events: [ev("retire", Y + 1, { pension: 10_000 })] }), Y, 2).rows;
    expect(r[1].income).toBeCloseTo(11_000, 9);
  });

  it("one-off costs, recurring costs and windfalls", () => {
    const events = [ev("oneOff", Y, { amount: 5_000 }), ev("recurring", Y, { amount: 1_000, years: 2 }), ev("windfall", Y + 1, { amount: 3_000 })];
    const r = project(flat({ events }), Y, 3).rows;
    expect(r.map((x) => x.netCash)).toEqual([8_000 - 5_000 - 1_000, 8_000 - 1_000 + 3_000, 8_000]);
  });

  it("moving home: the current one is sold and its equity counts towards the next", () => {
    const plan = flat({
      housing: { kind: "own", value: 200_000, mortgage: 0, ratePct: 0, yearsLeft: 0 },
      events: [ev("home", Y, { price: 300_000, depositPct: 50, costs: 0, ratePct: 0, termYears: 10, sellCurrent: true })],
    });
    const p = project(plan, Y, 1);
    // +200,000 sale − 150,000 deposit − 15,000 mortgage + 40,000 − 20,000 = +55,000
    expect(p.rows[0]).toMatchObject({ inflows: 200_000, homeValue: 300_000, mortgage: 135_000 });
    expect(p.rows[0].savings).toBe(65_000);
    expect(p.milestones.find((m) => m.kind === "depositShort")).toBeUndefined();
  });
});

describe("milestones", () => {
  it("warns when the deposit isn't there yet, and says when it would be", () => {
    const home = ev("home", Y + 1, { price: 300_000, depositPct: 10, costs: 0, ratePct: 0, termYears: 25 });
    const m = project(flat({ events: [home] }), Y, 10).milestones.find((x) => x.kind === "depositShort");
    // Needs 30,000; has 18,000 at the end of 2026; 34,000 by the end of 2028, so 2029.
    expect(m).toMatchObject({ year: Y + 1, needed: 30_000, have: 18_000, readyYear: Y + 3 });
  });

  it("flags the year money runs out", () => {
    const p = project(flat({ savings: 0, spending: 35_000 }), Y, 5);
    expect(p.milestones[0]).toEqual({ kind: "cashOut", year: Y });
  });

  it("financial independence when savings × withdrawal rate cover the year's costs", () => {
    // Costs 32,000 at 4% need 800,000; savings grow 8,000 a year from 10,000.
    const p = project(flat({ withdrawalPct: 4 }), Y, 120);
    expect(p.milestones.find((m) => m.kind === "independent")?.year).toBe(Y + 98);
  });

  it("net-worth marks are in today's money", () => {
    const p = project(flat({ savings: 90_000 }), Y, 3);
    expect(p.milestones).toContainEqual({ kind: "netWorth", year: Y + 1, amount: 100_000 });
  });
});

describe("share link", () => {
  it("round-trips the plans, without the ids", () => {
    const shared = { horizon: 25, plans: [examplePlan(Y), flat()] };
    const back = decodeShared(encodeShared(shared), Y)!;
    expect(back.horizon).toBe(25);
    expect(back.plans).toHaveLength(2);
    const strip = (p: Plan) => ({ ...p, events: p.events.map((e) => ({ ...e, id: "" })) });
    expect(back.plans.map(strip)).toEqual(shared.plans.map(strip));
  });

  it("rejects junk and clamps what it keeps", () => {
    expect(decodeShared("not-base64!!", Y)).toBeNull();
    expect(decodeShared(undefined, Y)).toBeNull();
    const p = cleanPlan({ savings: "1e99", takeHome: -5, events: [{ kind: "evil" }, { kind: "oneOff", amount: 5, year: 1900 }] }, Y)!;
    expect(p.savings).toBe(1e9);
    expect(p.takeHome).toBe(0);
    expect(p.events).toHaveLength(1);
    expect(p.events[0].year).toBe(Y);
  });
});
