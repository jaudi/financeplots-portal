import { NextRequest, NextResponse } from "next/server";
import { getUniverse, UNIVERSE_SCREENS, type UniverseScreen } from "@/lib/screener";

export const revalidate = 604800; // 7 days — must be a literal for Next's route-config analyzer

export async function GET(req: NextRequest) {
  const screen = req.nextUrl.searchParams.get("screen") ?? "sp500";

  // Validated against the allowlist rather than interpolated: the value reaches
  // a fetch URL, and an unchecked query param there is someone else's fetch.
  if (!UNIVERSE_SCREENS.includes(screen as UniverseScreen)) {
    return NextResponse.json({ error: "Unknown screen" }, { status: 400 });
  }

  const data = await getUniverse(screen as UniverseScreen);
  if (!data) {
    return NextResponse.json({ error: "Universe unavailable" }, { status: 503 });
  }
  return NextResponse.json(data);
}
