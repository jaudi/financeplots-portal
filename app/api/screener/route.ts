import { NextResponse } from "next/server";
import { getSp500Report, SCREENER_REVALIDATE_SECONDS } from "@/lib/screener";

export const revalidate = SCREENER_REVALIDATE_SECONDS;

export async function GET() {
  const report = await getSp500Report();
  if (!report) {
    return NextResponse.json({ error: "Report unavailable" }, { status: 503 });
  }
  return NextResponse.json(report);
}
