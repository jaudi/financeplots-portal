import { NextResponse, type NextRequest } from "next/server";
import { searchSymbols } from "@/lib/symbol-search";

// Company name → ticker, for the search boxes on the price tools.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 40);
  try {
    const results = await searchSymbols(q);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (err) {
    console.error("Symbol search error:", err);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
