// The pure parts of components/GuidedChat.tsx, kept apart so tests can reach them.

/** `words`: what someone might say or type to pick this option, in either language. */
export interface ChatOption { label: string; words: string[]; apply: () => void }

/** How an amount is read back and rounded: money, days and plain counts are whole;
 *  percentages and multiples keep up to two decimals (2.5%, 1.5×). */
export type AmountUnit = "money" | "number" | "days" | "percent" | "multiple";

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** The option an answer names, if exactly one matches. */
export function matchOption(options: ChatOption[], heard: string): ChatOption | null {
  const h = ` ${fold(heard).replace(/[^a-z0-9&%£$€¥₹]+/g, " ")} `;
  const hits = options.filter((o) => [o.label, ...o.words].some((w) => h.includes(` ${fold(w).trim()} `)));
  return hits.length === 1 ? hits[0] : null;
}

export function roundForUnit(unit: AmountUnit, v: number): number {
  return unit === "percent" || unit === "multiple" ? Math.round(v * 100) / 100 : Math.round(v);
}
