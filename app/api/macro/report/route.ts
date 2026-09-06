import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { fetchIndicators, type MacroIndicator } from "@/lib/fred";

// Adaptive thinking plus generation needs more than the platform default.
export const maxDuration = 60;

const MODEL = "claude-sonnet-5";
const TARGET_WORDS = 400;

const SYSTEM = `You are a macro strategist writing the standing commentary that accompanies a live US macro dashboard on FinancePlots, a site used by finance directors and CFOs at small and mid-sized businesses.

Rules you must follow:
- Write approximately ${TARGET_WORDS} words. Never go below 360 or above 440.
- Use ONLY the indicator values supplied in the user message. Never introduce a number, date, central bank decision, or market event that is not in that data.
- Every indicator is a published vintage with its own observation date. Say what the data shows as of those dates. Do not imply you know anything more recent.
- Write in plain prose: three or four short paragraphs, no headings, no bullet lists, no markdown emphasis. It is read as body copy under the dashboard cards.
- Never print a raw ISO date. Write quarterly readings as "Q2 2026", monthly readings as "July 2026", and daily readings as "3 September 2026".
- The reader runs a business, not a fund. Connect the numbers to what they affect: cost of borrowing, input costs, wage pressure, demand.
- The "change" figure is the move versus the prior published reading of that same series. Describe direction, and say when a change is not available.
- This is commentary, not advice. Never recommend buying, selling, or holding any security, and never forecast a specific level or a specific Fed decision.
- Return only the report text. No preamble, no sign-off, no title.`;

function buildPrompt(indicators: MacroIndicator[], today: string): string {
  const rows = indicators
    .map((i) => {
      const change = i.change == null
        ? "change vs prior reading: not available"
        : `change vs prior reading: ${i.change > 0 ? "+" : ""}${i.change.toFixed(2)}`;
      return `- ${i.label} (${i.id}, ${i.group}): ${i.value.toFixed(2)}% — observation date ${i.date}, ${change}`;
    })
    .join("\n");

  return `Today's date is ${today}. Here are the latest published values from FRED:

${rows}

Write the dashboard commentary.`;
}

async function generateReport(indicators: MacroIndicator[], today: string) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: SYSTEM,
    messages: [{ role: "user", content: buildPrompt(indicators, today) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Model declined to generate the macro commentary");
  }

  const report = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!report) throw new Error("Empty macro commentary returned");

  return {
    report,
    model: response.model,
    generatedAt: new Date().toISOString(),
    asOf: indicators.map((i) => i.date).sort().at(-1) ?? null,
  };
}

/**
 * The indicator array is part of the cache key, so the model is called again only
 * when FRED actually publishes a new number — at most once a day, since the freshest
 * series here (DGS10) is daily and the rest are monthly or quarterly. A thrown error
 * is not cached, so a failed generation retries on the next request.
 */
const getCachedReport = unstable_cache(generateReport, ["macro-report-v3"], {
  revalidate: 86400,
  tags: ["macro-report"],
});

export async function GET() {
  const fredKey = process.env.FRED_API_KEY;
  if (!fredKey) {
    return NextResponse.json({ error: "FRED_API_KEY not configured" }, { status: 503 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  try {
    const indicators = await fetchIndicators(fredKey);
    if (indicators.length === 0) {
      return NextResponse.json({ error: "No indicators available from FRED" }, { status: 503 });
    }

    // Date only: a timestamp would change the cache key on every request.
    const today = new Date().toISOString().slice(0, 10);
    const result = await getCachedReport(indicators, today);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Macro report error:", err);
    return NextResponse.json({ error: "Could not generate the macro commentary" }, { status: 500 });
  }
}
