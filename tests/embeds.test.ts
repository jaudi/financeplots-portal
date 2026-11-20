import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { EMBED_UTM, embedSnippet, mortgageEmbed, salaryEmbed, withUtm } from "@/lib/embeds";

describe("embeddable cards", () => {
  it("points the iframe at the card and the visible link at the full page", () => {
    const e = salaryEmbed(45_000);
    expect(e.src).toBe("https://www.financeplots.com/embed/salary/45000");
    expect(e.pageUrl).toBe("https://www.financeplots.com/tools/take-home-pay/45000-after-tax");
    const html = embedSnippet(e);
    expect(html).toContain('<iframe src="https://www.financeplots.com/embed/salary/45000"');
    expect(html).toContain('title="£45,000 after tax in 2026/27 — FinancePlots"');
    // The link a search engine credits must be outside the iframe, plain and untagged.
    expect(html).toMatch(/<\/iframe>\n<p[^>]*><a href="https:\/\/www\.financeplots\.com\/tools\/take-home-pay\/45000-after-tax">/);
    expect(html.split("utm_").length).toBe(1);

    const m = mortgageEmbed(200_000);
    expect(m.src).toBe("https://www.financeplots.com/embed/mortgage/200000");
    expect(embedSnippet(m)).toContain('href="https://www.financeplots.com/tools/lending/200000-mortgage"');
  });

  it("tags links inside a card so clicks from embeds can be counted", () => {
    expect(withUtm("https://www.financeplots.com/x")).toBe(`https://www.financeplots.com/x?${EMBED_UTM}`);
    expect(withUtm("https://www.financeplots.com/x?a=1")).toBe(`https://www.financeplots.com/x?a=1&${EMBED_UTM}`);
  });

  it("keeps /embed out of the language redirect and out of analytics", () => {
    const root = path.join(__dirname, "..");
    expect(fs.readFileSync(path.join(root, "proxy.ts"), "utf8")).toMatch(/\(\?!api\|embed\|/);
    const layout = fs.readFileSync(path.join(root, "app", "embed", "layout.tsx"), "utf8");
    expect(layout).not.toMatch(/@vercel\/analytics/);
    expect(layout).toMatch(/index: false/);
  });
});
