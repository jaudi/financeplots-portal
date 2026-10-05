import { describe, expect, it } from "vitest";
import { asCurrency, CURRENCIES, CURRENCY_WORDS } from "@/lib/currency";
import { matchOption } from "@/lib/guided-chat";

describe("currencies", () => {
  it("offers pounds, dollars and euros, nothing else", () => {
    expect([...CURRENCIES]).toEqual(["£", "$", "€"]);
  });

  it("falls back to pounds for anything else (an old stored ¥ or ₹)", () => {
    expect(asCurrency("€")).toBe("€");
    expect(asCurrency("¥")).toBe("£");
    expect(asCurrency("₹")).toBe("£");
    expect(asCurrency(null)).toBe("£");
  });

  it("understands the currency by name in English and Spanish", () => {
    const options = CURRENCIES.map(c => ({ label: c, words: CURRENCY_WORDS[c], apply: () => {} }));
    expect(matchOption(options, "dollars")?.label).toBe("$");
    expect(matchOption(options, "en euros")?.label).toBe("€");
    expect(matchOption(options, "libras esterlinas")?.label).toBe("£");
  });
});
