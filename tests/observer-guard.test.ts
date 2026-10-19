import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain .mjs script, no type declarations
import { publishBlockers } from "../scripts/observer/guard.mjs";

const dir = path.resolve(__dirname, "../content/observer");
const base = { title: "The week", body: "Markets fell.", sources: [{ url: "https://example.com" }] };

describe("Observer publish guard", () => {
  // Every published edition was approved by a person; the guard must not stop one like it.
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    it(`lets ${file} publish`, () => {
      const edition = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      expect(publishBlockers(edition)).toEqual([]);
    });
  }

  it.each([
    "Investors should buy Nvidia now.",
    "Shares look cheap after the fall.",
    "A buying opportunity in European banks.",
    "It is worth owning gold here.",
    "Analysts raised their price target.",
    "The stock is undervalued.",
    "Strategists went overweight Japan.",
  ])("stops %s", (sentence) => {
    expect(publishBlockers({ ...base, body: sentence })).not.toEqual([]);
  });

  it.each([
    "Amazon agreed to buy a start-up for $7bn.",
    "A chip sell-off hit Seoul as foreign selling persisted.",
    "Borrowing is not getting cheaper.",
    "The Bank of England is expected to hold rates.",
  ])("lets %s through", (sentence) => {
    expect(publishBlockers({ ...base, body: sentence })).toEqual([]);
  });

  it("ignores wording inside source links and titles", () => {
    const edition = {
      ...base,
      body: "Stocks rose, [CNBC reported](https://cnbc.com/investors-should-buy-the-dip).",
      sources: [{ title: "Why you should buy the dip", url: "https://cnbc.com" }],
    };
    expect(publishBlockers(edition)).toEqual([]);
  });

  it("stops an edition with no sources", () => {
    expect(publishBlockers({ ...base, sources: [] })).not.toEqual([]);
  });
});
