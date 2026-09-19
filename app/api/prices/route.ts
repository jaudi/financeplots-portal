import { NextResponse, type NextRequest } from "next/server";
import { getPriceHistory, isUnknownSymbol, normaliseSymbol, PRICE_RANGES, type PriceRange } from "@/lib/prices";

export async function GET(req: NextRequest) {
  const symbol = normaliseSymbol(req.nextUrl.searchParams.get("symbol") ?? "");
  const rangeParam = req.nextUrl.searchParams.get("range") ?? "1y";
  if (!symbol) return NextResponse.json({ error: "invalid_symbol" }, { status: 400 });
  if (!PRICE_RANGES.includes(rangeParam as PriceRange)) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }

  try {
    const history = await getPriceHistory(symbol, rangeParam as PriceRange);
    return NextResponse.json(history, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (err) {
    if (isUnknownSymbol(err)) return NextResponse.json({ error: "unknown_symbol" }, { status: 404 });
    console.error(`Prices API error for ${symbol}:`, err);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
