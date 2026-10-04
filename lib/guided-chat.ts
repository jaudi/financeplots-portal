// The pure parts of components/GuidedChat.tsx, kept apart so tests can reach them.

/** `words`: what someone might say or type to pick this option, in either language. */
export interface ChatOption { label: string; words: string[]; apply: () => void }

/** How an amount is read back and rounded: money, days and plain counts are whole;
 *  percentages, multiples and decimals keep up to two decimals (2.5%, 1.5×, 2.5). */
export type AmountUnit = "money" | "number" | "days" | "percent" | "multiple" | "decimal";

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s: string) => fold(s).replace(/[^a-z0-9&%£$€¥₹]+/g, " ").trim();

/** The option an answer names, if exactly one matches. When several match but
 *  one matched word contains all the others ("pre-seed" holds "seed"), the
 *  longer one wins. */
export function matchOption(options: ChatOption[], heard: string): ChatOption | null {
  const h = ` ${norm(heard)} `;
  const hits: { o: ChatOption; w: string }[] = [];
  for (const o of options) {
    const found = [o.label, ...o.words].map(norm).filter((w) => w && h.includes(` ${w} `));
    if (found.length) hits.push({ o, w: found.reduce((a, b) => (b.length > a.length ? b : a)) });
  }
  if (hits.length === 1) return hits[0].o;
  const longest = hits.reduce<{ o: ChatOption; w: string } | null>((a, b) => (!a || b.w.length > a.w.length ? b : a), null);
  return longest && hits.every((x) => x === longest || longest.w.includes(x.w)) ? longest.o : null;
}

export function roundForUnit(unit: AmountUnit, v: number): number {
  return unit === "percent" || unit === "multiple" || unit === "decimal" ? Math.round(v * 100) / 100 : Math.round(v);
}

/** Answers that mean "nothing here", for optional questions. */
export function meansNone(text: string): boolean {
  return ["none", "no", "nothing", "skip", "ninguno", "ninguna", "nada", "no hay", "saltar"].includes(norm(text));
}

/** "a loss of 50k", "-50k", "pérdida de 50.000" → the amount counts as negative. */
export function meansNegative(text: string): boolean {
  return /^\s*[-−–]/.test(text) || /\b(loss|minus|negative|menos|negativo|negativa)\b|perdida/.test(fold(text));
}

/** A list typed or spoken on one line: split on commas followed by a space, on
 *  semicolons and on new lines (so "1,000" and "2,5" stay whole). */
export function splitList(text: string): string[] {
  return text.split(/\s*;\s*|,\s+|\s*\n\s*/).map((s) => s.trim()).filter(Boolean);
}
