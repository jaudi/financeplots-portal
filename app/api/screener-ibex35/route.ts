import { NextResponse } from "next/server";
import { getIbex35Report } from "@/lib/screener";

export const revalidate = 604800; // 7 days — must be a literal for Next's route-config analyzer

export async function GET() {
  const report = await getIbex35Report();
  if (!report) {
    return NextResponse.json({ error: "Report unavailable" }, { status: 503 });
  }
  return NextResponse.json(report);
}
