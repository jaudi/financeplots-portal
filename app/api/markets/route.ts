import { NextResponse } from "next/server";
import { getMarketQuotes } from "@/lib/markets";

export const revalidate = 60;

export async function GET() {
  try {
    const quotes = await getMarketQuotes();
    return NextResponse.json({ quotes, ts: Date.now() });
  } catch (err) {
    console.error("Markets API error:", err);
    return NextResponse.json({ quotes: [], ts: Date.now() }, { status: 500 });
  }
}
