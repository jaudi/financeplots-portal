import { NextResponse } from "next/server";
import { castVote, feedbackEnabled, getCounts, isFeedbackTool, isVote } from "@/lib/feedback";

// "Was this tool useful?" — see lib/feedback.ts.
//   GET  ?tool=lending            → { enabled }            (no Redis call: the widget asks on every page view)
//   GET  ?tool=lending&counts=1   → { enabled, up, down }  (only for someone who has already voted)
//   POST { tool, vote, previous? } → { enabled, up, down }

const headers = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tool = url.searchParams.get("tool");
  if (!isFeedbackTool(tool)) return NextResponse.json({ error: "unknown tool" }, { status: 400, headers });
  if (!feedbackEnabled()) return NextResponse.json({ enabled: false }, { headers });
  if (url.searchParams.get("counts") !== "1") return NextResponse.json({ enabled: true }, { headers });
  try {
    return NextResponse.json({ enabled: true, ...(await getCounts(tool)) }, { headers });
  } catch {
    return NextResponse.json({ enabled: true, error: "unavailable" }, { status: 503, headers });
  }
}

export async function POST(req: Request) {
  if (!feedbackEnabled()) return NextResponse.json({ enabled: false }, { status: 503, headers });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400, headers });
  }
  const { tool, vote, previous } = (body ?? {}) as Record<string, unknown>;
  if (!isFeedbackTool(tool) || !isVote(vote) || (previous !== undefined && !isVote(previous))) {
    return NextResponse.json({ error: "bad request" }, { status: 400, headers });
  }
  try {
    return NextResponse.json({ enabled: true, ...(await castVote(tool, vote, previous)) }, { headers });
  } catch {
    return NextResponse.json({ enabled: true, error: "unavailable" }, { status: 503, headers });
  }
}
