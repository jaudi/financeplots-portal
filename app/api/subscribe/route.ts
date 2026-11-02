import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  confirmationEmail,
  confirmationUrl,
  normaliseEmail,
  signingKey,
  siteBase,
  toLocale,
} from "@/lib/newsletter";

// Step 1 of 2 for The Observer by email: send a confirmation link. Nothing is
// stored here — the address only joins the list (a Resend segment) when its
// owner clicks that link (/observer/confirm → /api/subscribe/confirm).
//
// The sender is env-configurable so it can change from the Vercel dashboard
// without a deploy — an unverified domain makes Resend reject every send from it.
const FROM = process.env.RESEND_FROM ?? "FinancePlots <hello@financeplots.com>";

function errorDetail(err: unknown) {
  if (err && typeof err === "object" && "message" in err) return String(err.message);
  return String(err);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: a field people never see. Bots that fill it get a quiet "success".
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const email = normaliseEmail(body?.email);
  if (!email) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const locale = toLocale(body?.locale);

  const key = signingKey();
  if (!process.env.RESEND_API_KEY || !key) {
    console.error("[subscribe] RESEND_API_KEY is not set — no confirmation sent");
    return NextResponse.json({ error: "Mail is not configured" }, { status: 503 });
  }

  const link = confirmationUrl(email, locale, key, siteBase());
  const { subject, html, text } = confirmationEmail(locale, link);

  // The SDK reports a refusal two ways: a thrown error, and a resolved response
  // carrying `error`. Checking only for the throw reports a rejected send as sent.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.send({ from: FROM, to: email, subject, html, text });
    if (res.error) {
      console.error(`[subscribe] confirmation to ${email} rejected by Resend: ${JSON.stringify(res.error)}`);
      return NextResponse.json({ error: "Could not send the confirmation email" }, { status: 502 });
    }
  } catch (err) {
    console.error(`[subscribe] confirmation to ${email} threw: ${errorDetail(err)}`);
    return NextResponse.json({ error: "Could not send the confirmation email" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
