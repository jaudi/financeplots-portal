// The currencies the planning tools offer: pounds, dollars and euros, nothing
// else (decided 2026-10-05). One list for every tool, so the pills, the chats'
// "which currency?" question and the PDFs can't drift apart.
//
// Only the symbol changes: the tools convert nothing, and the take-home pay
// calculator stays in pounds because it applies UK tax.

export const CURRENCIES = ["£", "$", "€"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "£";

/** Words a visitor may type or say for each currency (English and Spanish). */
export const CURRENCY_WORDS: Record<Currency, string[]> = {
  "£": ["pound", "pounds", "sterling", "libra", "libras", "gbp"],
  "$": ["dollar", "dollars", "dolar", "dolares", "usd"],
  "€": ["euro", "euros", "eur"],
};

/** ISO code, for structured data and spreadsheets. */
export const CURRENCY_CODES: Record<Currency, "GBP" | "USD" | "EUR"> = { "£": "GBP", "$": "USD", "€": "EUR" };

export function isCurrency(x: unknown): x is Currency {
  return typeof x === "string" && (CURRENCIES as readonly string[]).includes(x);
}

/** A stored or passed-in value as one of the three, else the default. */
export function asCurrency(x: unknown): Currency {
  return isCurrency(x) ? x : DEFAULT_CURRENCY;
}
