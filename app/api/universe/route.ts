import { NextRequest, NextResponse } from "next/server";
import { getUniverse, UNIVERSE_SCREENS, type UniverseScreen } from "@/lib/universe";

export const revalidate = 3600; // must be a literal for Next's route-config analyzer

export async function GET(req: NextRequest) {
  const screen = req.nextUrl.searchParams.get("screen") ?? "sp500";

  // Validated against the allowlist rather than interpolated: the value reaches
  // a fetch URL, and an unchecked query param there is someone else's fetch.
  if (!UNIVERSE_SCREENS.includes(screen as UniverseScreen)) {
    return NextResponse.json({ error: "Unknown index" }, { status: 400 });
  }

  const data = await getUniverse(screen as UniverseScreen);
  if (!data) {
    return NextResponse.json({ error: "Data unavailable" }, { status: 503 });
  }
  return NextResponse.json(data);
}
