import { NextResponse } from "next/server";
import { getPerformanceReport } from "@/lib/screener";

export const revalidate = 604800; // 7 days — must be a literal for Next's route-config analyzer

export async function GET() {
  const report = await getPerformanceReport();
  if (!report) {
    return NextResponse.json({ error: "Performance report unavailable" }, { status: 503 });
  }
  return NextResponse.json(report);
}
