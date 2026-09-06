import { NextResponse } from "next/server";
import { fetchIndicators } from "@/lib/fred";

export const revalidate = 86400;

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { indicators: [], ts: Date.now(), error: "FRED_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const indicators = await fetchIndicators(apiKey);
    return NextResponse.json({ indicators, ts: Date.now() });
  } catch (err) {
    console.error("Macro API error:", err);
    return NextResponse.json({ indicators: [], ts: Date.now() }, { status: 500 });
  }
}
