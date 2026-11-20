// Builds data/sp500-monthly.json for the Bull or Bear game: the S&P 500's
// month-end closes since 1928 from Yahoo Finance daily data (its monthly
// interval only starts in 1985) (^GSPC, price index — no
// dividends). Re-run now and then to add recent months:
//   node scripts/sp500-monthly.mjs
import { writeFileSync } from "node:fs";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const raw = await yf.chart("^GSPC", { period1: new Date("1927-12-01"), interval: "1d" }, { validateResult: false });
const byMonth = new Map();
for (const q of raw.quotes ?? []) {
  if (typeof q.close !== "number" || !Number.isFinite(q.close)) continue;
  byMonth.set(new Date(q.date).toISOString().slice(0, 7), Math.round(q.close * 100) / 100); // daily rows in date order: the last one in a month wins
}
// Drop the current, unfinished month.
const thisMonth = new Date().toISOString().slice(0, 7);
byMonth.delete(thisMonth);
const months = [...byMonth.keys()].sort();
const out = { source: "Yahoo Finance ^GSPC, monthly close (price index, excludes dividends)", start: months[0], closes: months.map((m) => byMonth.get(m)) };
// Check there are no gaps: one close per calendar month.
for (let i = 1; i < months.length; i++) {
  const [y0, m0] = months[i - 1].split("-").map(Number);
  const [y1, m1] = months[i].split("-").map(Number);
  if ((y1 * 12 + m1) - (y0 * 12 + m0) !== 1) throw new Error(`gap between ${months[i - 1]} and ${months[i]}`);
}
writeFileSync(new URL("../data/sp500-monthly.json", import.meta.url), JSON.stringify(out) + "\n");
console.log(`${months.length} months, ${months[0]} to ${months.at(-1)}`);
