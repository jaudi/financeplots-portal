// Free smoke test of every Observer data source — no Claude call, no cost.
// Run: node scripts/observer/check-sources.mjs
import * as s from "./sources.mjs";

const line = (ok, name, detail) => console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);

const macro = await s.macroSnapshot();
for (const [region, rows] of Object.entries(macro.data)) {
  for (const r of rows) line(true, `FRED ${region} ${r.id}`, `${r.value}${r.unit} @ ${r.date}${r.stale ? " (STALE)" : ""}`);
}
macro.errors.forEach((e) => line(false, e));

const markets = await s.marketSnapshot();
markets.data.forEach((m) => line(true, `Yahoo ${m.symbol}`, `${m.close} (1w ${m.change1w}%) @ ${m.date}`));
markets.errors.forEach((e) => line(false, e));

for (const [name, fn] of [
  ["Google News headlines", async () => { const h = await s.topHeadlines(3); return h.world.map((x) => x.title).join(" | "); }],
  ["Google News search", async () => (await s.newsSearch("ECB interest rates", 3)).map((x) => x.title).join(" | ")],
  ["GDELT tone", async () => JSON.stringify((await s.newsTone("economy")).weekAverageTone)],
  ["ApeWisdom", async () => JSON.stringify((await s.redditMentions(3)))],
  ["CNN Fear & Greed", async () => JSON.stringify(await s.fearAndGreed())],
  ...s.SUBREDDITS.map((sub) => [`Reddit r/${sub}`, async () => (await s.redditTop(sub, 3)).posts.map((p) => p.title).join(" | ")]),
]) {
  try {
    line(true, name, (await fn()).slice(0, 160));
  } catch (e) {
    line(false, name, e.message);
  }
}
