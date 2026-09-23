import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { callTool } from "./mcp-client";

// FRED stubbed: every series rises 0.25% a month, so each YoY figure is the same.
beforeAll(() => {
  vi.stubEnv("FRED_API_KEY", "test");
  vi.stubGlobal("fetch", async (url: string) => {
    const id = new URL(url).searchParams.get("series_id")!;
    const limit = Number(new URL(url).searchParams.get("limit"));
    const observations = Array.from({ length: limit }, (_, i) => ({
      date: `2026-${String(8 - (i % 8)).padStart(2, "0")}-01`,
      value: String(100 * 1.0025 ** (limit - i)),
    }));
    return new Response(JSON.stringify({ observations, id }), { status: 200 });
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("us_macro_indicators (item 7)", () => {
  it("includes core PCE year-on-year from FRED series PCEPILFE", async () => {
    const r = (await callTool("us_macro_indicators")).json;
    const core = r.indicators.find((i: { id: string }) => i.id === "PCEPILFE");
    expect(core).toMatchObject({ label: "Core PCE YoY", group: "Inflation" });
    expect(core.value).toBeCloseTo((1.0025 ** 12 - 1) * 100, 2);
    expect(r.indicators.filter((i: { group: string }) => i.group === "Inflation")).toHaveLength(4);
  });
});
