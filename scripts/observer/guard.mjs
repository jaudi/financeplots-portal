/**
 * Decides whether an Observer edition can publish itself, or waits for a person.
 *
 * The workflow merges the edition's pull request on its own only when this finds
 * nothing. It reads the text the agent wrote (not the source titles, which quote
 * other publishers) and flags the investment-recommendation wording the prompt
 * forbids. False alarms are cheap: the PR just stays open for review, as before.
 *
 * Run: node scripts/observer/guard.mjs content/observer/<date>.json
 * Exits 0 when clean, 1 with one reason per line when a person should look.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Advice aimed at the reader, not single words: the approved editions use "buy"
// for deals ("agreed to buy a startup"), "selling" for flows and "cheaper" for
// money, and none of that should stop an edition. Checked against every edition
// published so far, all of which pass.
const ACTION = "(buy|sell|hold|own|accumulate|add|avoid|trim|short)";
const FLAGGED = [
  [new RegExp(`\\b(should|ought to|consider|worth|time to|good time to|now to|better to)\\s+(be\\s+)?${ACTION}(ing)?\\b`, "i"), "advice to trade"],
  [/\b(strong buy|buy rating|sell rating|hold rating|outperform rating|underperform rating)\b/i, "rating"],
  [/\b(over|under)weight\b/i, "overweight/underweight"],
  [/\brecommend/i, "recommend"],
  [/\b(price target|target price)s?\b/i, "price target"],
  [/\b(under|over)valued\b/i, "undervalued/overvalued"],
  [/\b(is|are|looks?|looking|seems?|remains?)\s+(too\s+|very\s+)?(cheap|expensive)\b/i, "cheap/expensive"],
  [/\bbargains?\b/i, "bargain"],
  [/\b(buying|selling|investment) opportunit(y|ies)\b/i, "opportunity"],
  [/\bopportunit(y|ies) to (buy|sell)\b/i, "opportunity"],
  [/\b(upside|downside) (potential|target)\b/i, "upside/downside"],
];

/** The prose the agent wrote, with link targets removed so URLs can't match. */
function authoredText(edition) {
  const parts = [
    edition.title,
    edition.dek,
    edition.mood?.label,
    edition.mood?.explanation,
    ...(edition.regions ?? []).flatMap((r) => (typeof r === "string" ? [r] : Object.values(r))),
    ...(edition.watchNextWeek ?? []),
    edition.body,
  ];
  return parts
    .filter((p) => typeof p === "string")
    .join("\n")
    .replace(/\]\([^)]*\)/g, "]");
}

/** Reasons a person should read this edition before it goes live; empty when it can publish. */
export function publishBlockers(edition) {
  const reasons = [];
  const text = authoredText(edition);
  for (const [pattern, label] of FLAGGED) {
    const global = new RegExp(pattern.source, "gi");
    for (const m of text.matchAll(global)) {
      const start = Math.max(0, m.index - 60);
      const context = text.slice(start, m.index + m[0].length + 60).replace(/\s+/g, " ").trim();
      reasons.push(`"${label}" wording: …${context}…`);
    }
  }
  if (!edition.title?.trim() || !edition.body?.trim()) reasons.push("The title or body is empty.");
  if (!edition.sources?.length) reasons.push("No sources are cited.");
  return reasons;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const edition = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const reasons = publishBlockers(edition);
  for (const r of reasons) console.log(r);
  process.exit(reasons.length ? 1 : 0);
}
