import { describe, expect, it } from "vitest";
import { callTool, listTools } from "./mcp-client";

// The profitable case checked by hand in the external review. With the rate
// given explicitly, its output must never change.
const PROFITABLE = {
  revenue: 10_000_000,
  ebitda: 2_000_000,
  net_income: 1_200_000,
  free_cash_flow: 1_000_000,
  industry: "healthcare-it",
  net_debt: 1_000_000,
  discount_rate_pct: 12,
};

describe("business_valuation — loss-making inputs (item 1)", () => {
  it("rejects a company whose EBITDA, net income and FCF are all negative, pointing to startup_valuation", async () => {
    const r = await callTool("business_valuation", {
      revenue: 5_000_000,
      ebitda: -500_000,
      net_income: -800_000,
      free_cash_flow: -600_000,
      industry: "software-saas",
    });
    expect(r.isError).toBe(true);
    expect(r.text).toContain("startup_valuation");
  });

  it("leaves a method with a negative driver out of the average (positive EBITDA, net loss)", async () => {
    const r = await callTool("business_valuation", {
      revenue: 5_000_000,
      ebitda: 500_000,
      net_income: -800_000,
      free_cash_flow: 300_000,
      industry: "software-saas",
      discount_rate_pct: 12,
    });
    const eq = r.json.equity_value;
    expect(eq.pe).toBeNull();
    expect(r.json.enterprise_value.pe).toBeNull();
    expect(r.json.excluded_methods).toEqual([{ method: "pe", reason: expect.stringContaining("Net income") }]);
    expect(eq.average).toBe(Math.round((eq.dcf + eq.ev_ebitda + eq.ev_sales) / 3));
    expect(r.json.warnings ?? []).not.toContainEqual(expect.stringMatching(/^Only/));
  });

  it("never projects a negative FCF: the DCF is null with no projected years", async () => {
    const r = await callTool("business_valuation", {
      revenue: 5_000_000,
      ebitda: 500_000,
      net_income: 200_000,
      free_cash_flow: -600_000,
      industry: "software-saas",
      discount_rate_pct: 12,
    });
    expect(r.json.equity_value.dcf).toBeNull();
    expect(r.json.dcf_detail).toEqual({ years: [], pv_of_terminal_value: null });
    expect(r.json.excluded_methods.map((e: { method: string }) => e.method)).toEqual(["dcf"]);
  });

  it("warns when fewer than two methods are left", async () => {
    const r = await callTool("business_valuation", {
      revenue: 5_000_000,
      ebitda: -500_000,
      net_income: -800_000,
      free_cash_flow: 100_000,
      discount_rate_pct: 12,
    });
    expect(r.json.excluded_methods).toHaveLength(2);
    expect(r.json.warnings ?? []).not.toContainEqual(expect.stringMatching(/^Only/));

    const one = await callTool("business_valuation", {
      revenue: 0,
      ebitda: -500_000,
      net_income: -800_000,
      free_cash_flow: 100_000,
      discount_rate_pct: 12,
    });
    expect(one.json.excluded_methods).toHaveLength(3);
    expect(one.json.equity_value.average).toBe(one.json.equity_value.dcf);
    expect(one.json.warnings[0]).toMatch(/Only 1 of the four methods/);
  });

  it("leaves the profitable case exactly as it was", async () => {
    const r = await callTool("business_valuation", PROFITABLE);
    expect(r.json.enterprise_value).toEqual({ dcf: 14_598_360, ev_ebitda: 42_600_000, ev_sales: 53_000_000, pe: 45_880_000, average: 39_019_590 });
    expect(r.json.equity_value).toEqual({ dcf: 13_598_360, ev_ebitda: 41_600_000, ev_sales: 52_000_000, pe: 44_880_000, average: 38_019_590 });
    expect(r.json.dcf_detail.pv_of_terminal_value).toBe(9_859_924);
    expect(r.json.excluded_methods).toEqual([]);
  });
});

describe("business_valuation — consistency with startup_valuation (item 2)", () => {
  it("defaults the discount rate to the industry cost of capital and echoes it", async () => {
    const { discount_rate_pct: _, ...noRate } = PROFITABLE;
    const r = await callTool("business_valuation", noRate);
    expect(r.json.discount_rate_used_pct).toBe(8.22); // Healthcare IT
    expect(r.json.discount_rate_source).toMatch(/Healthcare IT/);
    expect(r.json.enterprise_value.dcf).toBeGreaterThan(14_598_360); // lower rate, higher DCF
  });

  it("keeps 12% when there is no industry, and echoes a given rate", async () => {
    const { industry: _, discount_rate_pct: __, ...noIndustry } = PROFITABLE;
    expect((await callTool("business_valuation", noIndustry)).json.discount_rate_used_pct).toBe(12);
    const given = await callTool("business_valuation", PROFITABLE);
    expect(given.json.discount_rate_used_pct).toBe(12);
    expect(given.json.discount_rate_source).toBe("given");
  });

  it("takes the private discount off enterprise value, before net debt", async () => {
    const base = (await callTool("business_valuation", PROFITABLE)).json;
    const r = (await callTool("business_valuation", { ...PROFITABLE, private_discount_pct: 25 })).json;
    for (const m of ["dcf", "ev_ebitda", "ev_sales", "pe"]) {
      expect(r.enterprise_value[m]).toBeCloseTo(base.enterprise_value[m] * 0.75, -1);
      expect(r.equity_value[m]).toBeCloseTo(base.enterprise_value[m] * 0.75 - PROFITABLE.net_debt, -1);
    }
    expect(r.private_discount_pct).toBe(25);
  });

  it("reports dispersion and warns above 2x", async () => {
    const r = (await callTool("business_valuation", PROFITABLE)).json;
    expect(r.dispersion).toBeCloseTo(53_000_000 / 14_598_360, 2);
    expect(r.warnings).toContainEqual(expect.stringMatching(/disagree materially/));

    const close = (await callTool("business_valuation", {
      ...PROFITABLE,
      ev_ebitda_multiple: 7,
      ev_sales_multiple: 1.4,
      pe_ratio: 11,
    })).json;
    expect(close.dispersion).toBeLessThanOrEqual(2);
    expect(close.warnings ?? []).not.toContainEqual(expect.stringMatching(/disagree/));
  });

  it("says the free cash flow is FCFF and the industry P/E is forward", async () => {
    const { tools } = await listTools();
    const bv = tools.find((t) => t.name === "business_valuation")!;
    const props = bv.inputSchema.properties as Record<string, { description: string }>;
    expect(props.free_cash_flow.description).toMatch(/FCFF/);
    expect(props.pe_ratio.description).toMatch(/forward P\/E/);
  });
});
