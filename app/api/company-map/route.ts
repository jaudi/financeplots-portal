import { NextRequest, NextResponse } from "next/server";
import { getCompanyProfile } from "@/lib/company";
import { cardFrom } from "@/lib/company-map";
import { normaliseSymbol } from "@/lib/price-types";

export const revalidate = 3600; // must be a literal for Next's route-config analyzer

/** The card the company map opens for one company: ?t=SAN.MC. Only companies
 *  in the four indices have one. */
export async function GET(req: NextRequest) {
  const ticker = normaliseSymbol(req.nextUrl.searchParams.get("t") ?? "");
  if (!ticker) return NextResponse.json({ error: "Unknown ticker" }, { status: 400 });

  const profile = await getCompanyProfile(ticker);
  if (!profile) return NextResponse.json({ error: "Not in the indices" }, { status: 404 });

  return NextResponse.json(cardFrom(profile), {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
