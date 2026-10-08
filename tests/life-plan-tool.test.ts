import { describe, expect, it } from "vitest";
import { decodeShared } from "@/lib/life-plan";
import { callTool } from "./mcp-client";

// life_plan through the real MCP server. The maths is tested in
// tests/life-plan.test.ts; these check the inputs reach it as the page would
// send them. Rates are zero so every figure can be worked by hand.

const Y = new Date().getUTCFullYear();
const FLAT = {
  savings: 10_000,
  take_home_per_year: 30_000,
  spending_per_year: 20_000,
  housing: { type: "rent", rent_monthly: 0 },
  pay_growth_pct: 0,
  inflation_pct: 0,
  return_pct: 0,
  house_price_pct: 0,
  chart: false,
};

describe("life_plan tool", () => {
  it("projects year by year and dates the milestones", async () => {
    const r = await callTool("life_plan", { ...FLAT, years: 10 });
    expect(r.isError).toBe(false);
    const plan = r.json.plans[0];
    expect(plan.name).toBe("Plan");
    expect(plan.today.net_worth).toBe(10_000);
    // £10,000 saved a year, nothing earned on it.
    expect(plan.yearly[0]).toMatchObject({ year: Y, income: 30_000, living_costs: 20_000, net_cash: 10_000, savings: 20_000 });
    expect(plan.at_end).toEqual({ year: Y + 9, savings: 110_000, net_worth: 110_000, net_worth_todays_money: 110_000 });
    expect(plan.milestones).toContainEqual(expect.objectContaining({ kind: "net_worth_mark", amount_todays_money: 100_000, year: Y + 8 }));
  });

  it("links to the page with the same plan", async () => {
    const r = await callTool("life_plan", { ...FLAT, years: 12, events: [{ kind: "windfall", year: Y + 2, amount: 5_000 }] });
    const p = new URL(r.json.tool_page).searchParams.get("p")!;
    const shared = decodeShared(p, Y)!;
    expect(shared.horizon).toBe(12);
    expect(shared.plans[0]).toMatchObject({ savings: 10_000, takeHome: 30_000, inflationPct: 0, events: [{ kind: "windfall", year: Y + 2, amount: 5_000 }] });
  });

  it("starts Plan B as a copy of the plan and changes only what it is given", async () => {
    const r = await callTool("life_plan", { ...FLAT, years: 5, plan_b: { take_home_per_year: 35_000 } });
    expect(r.isError).toBe(false);
    const [a, b] = r.json.plans;
    expect([a.name, b.name]).toEqual(["Plan A", "Plan B"]);
    // B keeps A's zero rates rather than the tool's defaults: exactly £5,000 more a year.
    expect(b.at_end.savings - a.at_end.savings).toBe(25_000);
    expect(r.json.b_minus_a_at_end).toEqual({ net_worth: 25_000, net_worth_todays_money: 25_000, savings: 25_000 });
  });

  it("sells the home owned today before buying the next unless told not to", async () => {
    const owner = { ...FLAT, housing: { type: "own", home_value: 200_000, mortgage_left: 0 }, years: 5 };
    const home = { kind: "home", year: Y + 1, price: 300_000, deposit_pct: 10, buying_costs: 0 };
    const sold = await callTool("life_plan", { ...owner, events: [home] });
    const kept = await callTool("life_plan", { ...owner, events: [{ ...home, sell_current_home: false }] });
    expect(sold.json.plans[0].yearly[1].inflows).toBe(200_000);
    expect(sold.json.plans[0].yearly[1].home_value).toBe(300_000);
    expect(kept.json.plans[0].yearly[1].inflows).toBe(0);
    expect(kept.json.plans[0].yearly[1].home_value).toBe(500_000);
  });

  it("flags a deposit that isn't there yet", async () => {
    const r = await callTool("life_plan", { ...FLAT, years: 10, events: [{ kind: "home", year: Y, price: 300_000, deposit_pct: 10, buying_costs: 0 }] });
    expect(r.json.plans[0].milestones).toContainEqual(expect.objectContaining({ kind: "deposit_short", year: Y, needed: 30_000, have: 10_000 }));
  });

  it("refuses events before this year and notes those after the last", async () => {
    const early = await callTool("life_plan", { ...FLAT, events: [{ kind: "one_off", year: Y - 1, amount: 1 }] });
    expect(early.isError).toBe(true);
    const late = await callTool("life_plan", { ...FLAT, years: 5, events: [{ kind: "one_off", year: Y + 7, amount: 1 }] });
    expect(late.json.events_after_last_year).toMatch(/raise `years`/);
  });
});
