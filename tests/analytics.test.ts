import { describe, expect, it } from "vitest";
import { pageOf } from "@/lib/analytics";

describe("pageOf", () => {
  it("drops the locale and folds company pages into one row", () => {
    expect(pageOf("/")).toBe("/");
    expect(pageOf("/es")).toBe("/");
    expect(pageOf("/es/tools/cash-flow")).toBe("/tools/cash-flow");
    expect(pageOf("/tools/stocks/SAN.MC")).toBe("/tools/stocks/[ticker]");
    expect(pageOf("/es/tools/stocks/AAPL")).toBe("/tools/stocks/[ticker]");
    expect(pageOf("/tools/stocks")).toBe("/tools/stocks");
    expect(pageOf("/estimates")).toBe("/estimates");
  });
});

describe("toolCount", () => {
  it("counts every tool route once, the Stocks hub as the tools inside it", async () => {
    const { readdirSync, statSync } = await import("node:fs");
    const { toolCount } = await import("@/lib/audiences");
    const dir = "app/[locale]/tools";
    const routes = readdirSync(dir).filter((d) => statSync(`${dir}/${d}`).isDirectory() && !["personal", "business", "stocks"].includes(d));
    expect(toolCount()).toBe(routes.length);
  });
});
