import { describe, expect, it } from "vitest";
import { layoutChart, THEMES } from "@/lib/charts/layout";
import { CHARTS_META_KEY, formatValue, type ChartSpec } from "@/lib/charts/spec";
import { breakEvenChart, valuationChart } from "@/lib/charts/tool-charts";
import { callTool } from "./mcp-client";

const PNG_MAGIC = "iVBORw0KGgo"; // base64 of the PNG signature

function expectSceneInBounds(spec: ChartSpec, width = 800, height = 450) {
  for (const theme of [THEMES.dark, THEMES.light]) {
    const scene = layoutChart(spec, { width, height, theme });
    for (const t of scene.texts) {
      expect(Number.isFinite(t.x) && Number.isFinite(t.y), t.text).toBe(true);
      expect(t.y, t.text).toBeGreaterThanOrEqual(0);
      expect(t.y, t.text).toBeLessThanOrEqual(height);
    }
    for (const s of scene.shapes) expect(JSON.stringify(s)).not.toMatch(/NaN|Infinity/);
    expect(scene.hits).toHaveLength(spec.x.labels.length);
  }
}

describe("chart layout", () => {
  it("formats axis values compactly, with currency and units", () => {
    expect(formatValue(0, "money")).toBe("0");
    expect(formatValue(1_250_000, "money", "GBP")).toBe("£1.3M");
    expect(formatValue(-4_000_000, "money")).toBe("−4M");
    expect(formatValue(1250, "units")).toBe("1,250");
    expect(formatValue(12.5, "pct")).toBe("12.5%");
    expect(formatValue(1234.5, "pct")).toBe("1.2k%");
    expect(formatValue(12.5, "pct", undefined, "full")).toBe("12.5%");
  });

  it("keeps a chart with negative bars, a reference line and markers inside its frame", () => {
    expectSceneInBounds(valuationChart({ dcf: -2_000_000, ev_ebitda: 41_600_000, ev_sales: 52_000_000, pe: null, average: 30_000_000 }));
    expectSceneInBounds(breakEvenChart(50_000, 100, 60, 1250, 1500));
  });

  it("puts the break-even marker exactly on the break-even point", () => {
    const spec = breakEvenChart(50_000, 100, 60, 1250);
    const i = spec.markers![0].index;
    const [lo, hi] = [Math.floor(i), Math.ceil(i)];
    const units = (k: number) => Number(spec.x.labels[k].replace(/,/g, ""));
    expect(units(lo) + (units(hi) - units(lo)) * (i - lo)).toBeCloseTo(1250, 6);
  });

  it("gives every hover band the value of every series", () => {
    const spec = valuationChart({ dcf: 13_598_360, ev_ebitda: 41_600_000, ev_sales: 52_000_000, pe: 44_880_000, average: 38_019_590 });
    const scene = layoutChart(spec, { width: 800, height: 450, theme: THEMES.light });
    expect(scene.hits[0].rows[0]).toMatchObject({ name: "Equity value", value: "13,598,360" });
  });
});

describe("tools return charts", () => {
  const cases: [string, Record<string, unknown>, number][] = [
    ["compound_interest", { initial_capital: 10_000, monthly_contribution: 300, annual_return_pct: 7, years: 30, inflation_pct: 2 }, 1],
    ["loan_repayment", { amount: 200_000, annual_rate_pct: 5, years: 25 }, 2],
    ["break_even", { fixed_costs: 50_000, selling_price: 100, variable_cost: 60, current_units: 1500 }, 1],
    ["business_valuation", { revenue: 1e7, ebitda: 2e6, net_income: 1.2e6, free_cash_flow: 1e6, industry: "healthcare-it", discount_rate_pct: 12 }, 1],
    [
      "startup_valuation",
      { revenue: 3e6, revenue_growth_pct: 60, current_operating_margin_pct: -150, industry: "healthcare-it", net_cash: 8e6, private_discount_pct: 25 },
      2,
    ],
  ];

  it.each(cases)("%s: JSON first, then PNG images, and the chart specs in _meta", async (name, args, images) => {
    const { client, close } = await rawClient();
    try {
      const res = await client.callTool({ name, arguments: args });
      const content = res.content as { type: string; data?: string; mimeType?: string; text?: string }[];
      expect(content[0].type).toBe("text");
      expect(() => JSON.parse(content[0].text!)).not.toThrow();
      const pngs = content.filter((c) => c.type === "image");
      expect(pngs).toHaveLength(images);
      for (const p of pngs) {
        expect(p.mimeType).toBe("image/png");
        expect(p.data!.startsWith(PNG_MAGIC)).toBe(true);
      }
      expect((res._meta as Record<string, unknown[]>)[CHARTS_META_KEY]).toHaveLength(images);
    } finally {
      await close();
    }
  });

  it("returns the figures only with chart: false", async () => {
    const { client, close } = await rawClient();
    try {
      const res = await client.callTool({ name: "loan_repayment", arguments: { amount: 1000, annual_rate_pct: 5, years: 1, chart: false } });
      expect((res.content as unknown[]).length).toBe(1);
      expect(res._meta?.[CHARTS_META_KEY]).toBeUndefined();
    } finally {
      await close();
    }
  });

  it("adds no chart to an error", async () => {
    const r = await callTool("break_even", { fixed_costs: 1000, selling_price: 5, variable_cost: 6 });
    expect(r.isError).toBe(true);
  });
});

async function rawClient() {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
  const { createFinancePlotsServer } = await import("@/lib/mcp-server");
  const [c, s] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([createFinancePlotsServer().connect(s), client.connect(c)]);
  return { client, close: () => client.close() };
}
