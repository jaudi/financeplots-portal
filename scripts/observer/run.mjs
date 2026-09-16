/**
 * The Observer — weekly macro edition written by a Claude agent.
 *
 * 1. Collects a fixed snapshot (macro, markets, Fear & Greed, headlines, Reddit mentions).
 * 2. Gives Claude that snapshot plus tools to dig further (news search, news tone,
 *    Reddit threads, any FRED series) and lets it decide what matters this week.
 * 3. Claude submits the edition through `submit_edition`; this script checks every
 *    cited link was actually returned by a tool, then writes
 *    content/observer/<date>.json.
 *
 * Runs weekly in .github/workflows/observer.yml, which opens a pull request for review.
 * Needs ANTHROPIC_API_KEY, and FRED_API_KEY on cloud runners. Everything else is keyless.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import * as src from "./sources.mjs";

const MODEL = "claude-opus-5";
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(here, "../../content/observer");

const today = new Date().toISOString().slice(0, 10);
const log = (...a) => console.log(`[observer]`, ...a);

// ── 1. Snapshot ──────────────────────────────────────────────────────────────

async function attempt(name, fn, errors) {
  try {
    return await fn();
  } catch (e) {
    errors.push(`${name}: ${e.message}`);
    return null;
  }
}

log("collecting snapshot");
const sourceErrors = [];
const [macro, markets] = await Promise.all([src.macroSnapshot(), src.marketSnapshot()]);
sourceErrors.push(...macro.errors, ...markets.errors);
const fearGreed = await attempt("CNN Fear & Greed", src.fearAndGreed, sourceErrors);
const headlines = await attempt("Google News headlines", () => src.topHeadlines(20), sourceErrors);
const mentions = await attempt("ApeWisdom Reddit mentions", () => src.redditMentions(20), sourceErrors);

if (markets.data.length < 10 || Object.values(macro.data).flat().length < 10) {
  console.error("Too little market or macro data to write an edition.", sourceErrors);
  process.exit(1);
}

// Every URL a tool hands to Claude. Sources it cites must come from this set.
const seenUrls = new Set();
const remember = (items) => {
  for (const i of items ?? []) if (i.url) seenUrls.add(i.url);
  return items;
};
remember(headlines?.world);
remember(headlines?.business);

// ── 2. Tools ─────────────────────────────────────────────────────────────────

const json = (v) => JSON.stringify(v, null, 1);
let submitted = null;

const tools = [
  betaTool({
    name: "search_news",
    description:
      "Search news published in the last 7 days (Google News). Returns up to 12 headlines with publisher, date and URL. " +
      "Use it to confirm what happened, find the latest data prints (e.g. 'Japan CPI August', 'China PMI'), central bank decisions, " +
      "elections, fiscal and debt news, and trade or geopolitical events. Only headlines are returned, not article text.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Plain search terms, e.g. 'Bank of Japan rate decision'" },
        site: {
          type: "string",
          description: "Optional: limit to one publisher's domain, e.g. 'barrons.com' for company news and earnings coverage",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    run: async ({ query, site }) => json(remember(await src.newsSearch(query, 12, site))),
  }),
  betaTool({
    name: "list_sec_earnings_filings",
    description:
      "Companies that filed quarterly results with the SEC in the last 7 days (8-K, Item 2.02), with filing date, a filingId and the filing URL. " +
      "Mostly US-listed companies of every size, so combine it with news searches to see which results mattered. " +
      "Optional query narrows the full-text search, e.g. a company name.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Optional extra search terms, e.g. 'Oracle'" } },
      additionalProperties: false,
    },
    run: async ({ query }) => {
      const res = await src.secEarningsFilings(7, query);
      remember(res.filings);
      return json(res);
    },
  }),
  betaTool({
    name: "read_sec_earnings_release",
    description:
      "Plain text of a company's earnings press release (exhibit 99.1) from an SEC filing — the official reported figures. " +
      "Pass a filingId from list_sec_earnings_filings. Text is truncated to about 9,000 characters.",
    inputSchema: {
      type: "object",
      properties: { filing_id: { type: "string", description: "e.g. '2030781/0001628280-26-061015'" } },
      required: ["filing_id"],
      additionalProperties: false,
    },
    run: async ({ filing_id }) => {
      const res = await src.secEarningsRelease(filing_id);
      seenUrls.add(res.url);
      return json(res);
    },
  }),
  betaTool({
    name: "get_news_tone",
    description:
      "Average tone of worldwide news coverage for a topic over the last 7 days, per day (GDELT). " +
      "Scores are usually between -10 and +10; below zero means coverage is more negative than positive. " +
      "Compare topics or days rather than reading one number on its own. The service is sometimes unavailable.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Topic, e.g. 'inflation' or 'China economy'" } },
      required: ["query"],
      additionalProperties: false,
    },
    run: async ({ query }) => json(await src.newsTone(query)),
  }),
  betaTool({
    name: "get_reddit_top_posts",
    description:
      "Titles of the top posts of the week in one subreddit — a read on what retail investors and the public are talking about. " +
      "Post titles are user-written and unverified: treat them as a mood signal, never as fact. Reddit often rate-limits; an error is normal.",
    inputSchema: {
      type: "object",
      properties: { subreddit: { type: "string", enum: src.SUBREDDITS } },
      required: ["subreddit"],
      additionalProperties: false,
    },
    run: async ({ subreddit }) => json((await src.redditTop(subreddit)).posts),
  }),
  betaTool({
    name: "get_fred_series",
    description:
      "Latest reading of any FRED series by ID (e.g. 'DCOILBRENTEU', 'T10YIE' for 10-year breakeven inflation, 'MORTGAGE30US'). " +
      "Returns the latest value, its date, the prior reading and whether it is stale. " +
      "Use transform 'yoy' for price indexes you want as an annual % change.",
    inputSchema: {
      type: "object",
      properties: {
        series_id: { type: "string" },
        transform: { type: "string", enum: ["level", "yoy"] },
        frequency: { type: "string", enum: ["d", "m", "q", "a"], description: "Series frequency, used for YoY lag and staleness" },
      },
      required: ["series_id", "transform", "frequency"],
      additionalProperties: false,
    },
    run: async ({ series_id, transform, frequency }) =>
      json(await src.fredSeries(series_id, { transform, freq: frequency })),
  }),
  betaTool({
    name: "submit_edition",
    description: "Submit the finished edition. Call this exactly once, when the article is complete.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Headline, under 90 characters, no clickbait" },
        dek: { type: "string", description: "One-sentence standfirst under the headline, under 200 characters" },
        mood: {
          type: "object",
          properties: {
            label: { type: "string", enum: ["Risk-on", "Cautious optimism", "Mixed", "Nervous", "Risk-off"] },
            explanation: { type: "string", description: "Two sentences on why, citing the VIX, Fear & Greed and social signals" },
          },
          required: ["label", "explanation"],
          additionalProperties: false,
        },
        regions: {
          type: "array",
          description: "One card per region, in this order: US, Euro, Asia",
          items: {
            type: "object",
            properties: {
              region: { type: "string", enum: ["US", "Euro", "Asia"] },
              headline: { type: "string", description: "Under 70 characters" },
              summary: { type: "string", description: "Two or three plain-English sentences" },
            },
            required: ["region", "headline", "summary"],
            additionalProperties: false,
          },
        },
        watch_next_week: {
          type: "array",
          description: "3-6 scheduled events or data releases worth watching next week (e.g. 'US CPI for August, Wednesday'). No securities.",
          items: { type: "string" },
        },
        body_markdown: {
          type: "string",
          description: "The full article in Markdown. Use ## section headings. Link news claims inline to the URLs you were given.",
        },
        sources: {
          type: "array",
          description: "Every news article you relied on. URLs must be exactly as returned by the tools.",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              publisher: { type: "string" },
              url: { type: "string" },
            },
            required: ["title", "publisher", "url"],
            additionalProperties: false,
          },
        },
      },
      required: ["title", "dek", "mood", "regions", "watch_next_week", "body_markdown", "sources"],
      additionalProperties: false,
    },
    run: async (edition) => {
      const unknown = edition.sources.filter((s) => !seenUrls.has(s.url));
      const linked = [...edition.body_markdown.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1]);
      const unknownLinks = linked.filter((u) => !seenUrls.has(u));
      if (unknown.length || unknownLinks.length) {
        return (
          "Rejected: these URLs were not returned by any tool this session. Remove them or replace them with URLs you were given, then submit again.\n" +
          [...new Set([...unknown.map((s) => s.url), ...unknownLinks])].join("\n")
        );
      }
      submitted = edition;
      return "Edition accepted. You are done — do not call any more tools.";
    },
  }),
];

// ── 3. Prompt ────────────────────────────────────────────────────────────────

const SYSTEM = `You are the writer of The Observer, the weekly macro edition on FinancePlots — a free finance site read by finance directors, CFOs and curious individuals. Each week you explain what happened across the US, the euro area and Asia, and how markets and the public felt about it.

How to work:
- Start from the snapshot in the user message. Then use the tools to find the week's most important world news — central banks, inflation and growth data, government debt and deficits, elections and policy, trade, wars and energy — and to fill gaps the snapshot leaves (Japanese, Chinese and Indian inflation prints are not in it). Also search for the week's AI news: major deals and investments, new model releases, chips and data-centre spending, and regulation. For company news, check which large companies reported results this week (list_sec_earnings_filings, plus searches limited to barrons.com), read the official figures in their SEC earnings releases, and look for major deals, mergers and corporate news. Check what people are talking about on Reddit and how the tone of news coverage moved. Aim for breadth, then choose what actually mattered.
- Be efficient: run several searches in one turn when they are independent. Around 15-25 tool calls is usually enough.

What to write (submit it with submit_edition):
- About 1,300-1,500 words in the body, roughly a six-minute read. Sections, as ## headings: a short opening on the week in one paragraph; United States; Euro area; Asia; Debt and politics; AI and technology (exactly one paragraph: the biggest deals, model launches, investment and regulation news, and why it matters for the economy); Company news and results (one or two paragraphs: the week's most important earnings reports and corporate deals, and what they say about demand, costs and the economy); Market mood (VIX, Fear & Greed, credit spreads, what Reddit and news tone suggest); What to watch next week.
- Write for a smart reader who is not a markets professional. Plain English, short paragraphs. When you use a term like "yield curve", "credit spread" or "VIX", explain it in a few words the first time.
- Say why things matter for businesses and households: borrowing costs, prices, jobs, currencies, energy.

Rules you must follow:
- Numbers: use only figures from the snapshot or tool results, and say when they are from (e.g. "August CPI", "Friday's close"). Never invent or estimate a figure. If a series is marked stale, either leave it out or name its date plainly.
- News: only report events that appear in headlines returned by the tools, and link each claim inline to that headline's URL exactly as given. Headlines are short — do not add details the headline does not contain. List every article you relied on in sources.
- Reddit posts and titles are unverified opinion. Describe them only as a mood signal ("retail investors on Reddit were focused on…"), never as fact.
- This is commentary, not investment advice, and the site is regulated in the UK. Never recommend buying, selling or holding anything, never forecast a price or level, and never say an asset is cheap, expensive or a good opportunity. Talk about indices, rates, currencies and commodities, not individual companies' shares: do not name a listed company or ticker unless the company itself is a major macro or political news event, and then report the news without any view on its shares. The AI and technology and Company news and results sections are the exception where naming companies is normal — say who reported, announced a deal or released a model — but report only what happened: figures exactly as the company reported them in its SEC filing (and say they are company-reported), deals as announced. Never give a view on anyone's shares, valuation or prospects, do not describe share-price reactions, and do not call results good, bad, strong or disappointing — describe them against the company's own prior period or guidance instead. Barron's is paywalled: use its headlines as pointers to what mattered, not as the source of figures.
- Be even-handed on politics: report what governments and parties did and how markets reacted, without taking sides.
- The article body should not repeat the title. No sign-off.`;

const snapshot = {
  date: today,
  markets: markets.data,
  macro: macro.data,
  fearAndGreed: fearGreed,
  redditMostMentionedTickers: mentions,
  topHeadlines: headlines,
  unavailableSources: sourceErrors,
};

const userMessage = `Today is ${today}. Write this week's edition of The Observer.

Snapshot (collected just now):
${JSON.stringify(snapshot, null, 1)}

Notes on the snapshot:
- markets: close is the latest close; change1w and change1m are % changes. For yields (^TNX) and the VIX these are % changes of the level, not point changes — compute point moves yourself if you mention them.
- macro: YoY series are annual % changes computed from the index. "prior" is the previous reading.
- fearAndGreed: CNN's 0-100 index (0 = extreme fear, 100 = extreme greed).
- redditMostMentionedTickers: most-discussed tickers on Reddit investing communities, with mentions 24 hours earlier. Use it only as a gauge of retail attention (e.g. whether chatter is about broad index funds or speculative names); do not name the individual companies.`;

// ── 4. Run ───────────────────────────────────────────────────────────────────

log("running agent");
const client = new Anthropic();
const runner = client.beta.messages.toolRunner({
  model: MODEL,
  max_tokens: 32000,
  // The SDK refuses non-streaming requests this large (they can outlast HTTP timeouts).
  stream: true,
  thinking: { type: "adaptive" },
  output_config: { effort: "high" },
  // If a safety classifier declines, retry server-side on Anthropic's recommended fallback model.
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  max_iterations: 40,
  // Each tool round resends the whole conversation; caching it cuts input cost sharply.
  cache_control: { type: "ephemeral" },
  system: SYSTEM,
  tools,
  messages: [{ role: "user", content: userMessage }],
});

let usage = { input_tokens: 0, output_tokens: 0 };
let toolCalls = 0;
for await (const stream of runner) {
  const message = await stream.finalMessage();
  usage.input_tokens += message.usage.input_tokens ?? 0;
  usage.output_tokens += message.usage.output_tokens ?? 0;
  const calls = message.content.filter((b) => b.type === "tool_use");
  toolCalls += calls.length;
  for (const c of calls) log("tool", c.name, JSON.stringify(c.input).slice(0, 100));
  if (message.stop_reason === "refusal") {
    console.error("The model declined to write the edition:", message.stop_details);
    process.exit(1);
  }
  if (submitted) break;
}

if (!submitted) {
  console.error("The agent finished without submitting an edition.");
  process.exit(1);
}

// ── 5. Save ──────────────────────────────────────────────────────────────────

const edition = {
  slug: today,
  date: today,
  title: submitted.title,
  dek: submitted.dek,
  mood: submitted.mood,
  regions: submitted.regions,
  watchNextWeek: submitted.watch_next_week,
  body: submitted.body_markdown,
  sources: submitted.sources,
  data: {
    markets: markets.data,
    macro: macro.data,
    fearAndGreed: fearGreed,
  },
  meta: {
    model: MODEL,
    generatedAt: new Date().toISOString(),
    toolCalls,
    usage,
    unavailableSources: sourceErrors,
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, `${today}.json`);
fs.writeFileSync(file, JSON.stringify(edition, null, 2) + "\n");
log("wrote", path.relative(process.cwd(), file), `(${toolCalls} tool calls, ${usage.input_tokens} in / ${usage.output_tokens} out tokens)`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${today}\ntitle=${edition.title.replace(/\n/g, " ")}\n`);
}
