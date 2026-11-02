import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { escapeHtml, signingKey, verifyConfirmation } from "@/lib/newsletter";

// Step 2 of 2: the confirmation link opens /observer/confirm, whose button posts
// here. A POST behind a button rather than a GET on the link itself, because
// mail scanners open every link in an email — a GET would subscribe people who
// never clicked.
const FROM = process.env.RESEND_FROM ?? "FinancePlots <hello@financeplots.com>";
const NOTIFY_TO = process.env.CONTACT_TO ?? "hello@financeplots.com";

type Result = { data?: unknown; error?: unknown } | null | undefined;
const failed = (r: Result) => !r || Boolean(r.error);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const key = signingKey();
  const segmentId = process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID;
  if (!process.env.RESEND_API_KEY || !key || !segmentId) {
    console.error("[subscribe/confirm] RESEND_API_KEY or RESEND_SEGMENT_ID is not set");
    return NextResponse.json({ status: "error" }, { status: 503 });
  }

  const check = verifyConfirmation({ e: body?.e, x: body?.x, t: body?.t }, key);
  if (!check.ok) return NextResponse.json({ status: check.reason }, { status: 400 });
  const { email } = check;

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // New address: create it in the segment. Known address (an earlier sign-up, or
    // someone who unsubscribed and has now asked again): clear the unsubscribe and
    // make sure it is in the segment.
    const created = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
    if (failed(created)) {
      const updated = await resend.contacts.update({ email, unsubscribed: false });
      if (failed(updated)) {
        console.error(
          `[subscribe/confirm] could not add ${email}: create ${JSON.stringify(created?.error)}, update ${JSON.stringify(updated?.error)}`,
        );
        return NextResponse.json({ status: "error" }, { status: 502 });
      }
      const added = await resend.contacts.segments.add({ email, segmentId });
      // Already in the segment is fine; anything else is logged but the contact exists.
      if (failed(added)) console.warn(`[subscribe/confirm] segment add for ${email}: ${JSON.stringify(added?.error)}`);
    }
  } catch (err) {
    console.error(`[subscribe/confirm] could not add ${email}: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ status: "error" }, { status: 502 });
  }

  // Best effort: the subscriber is already on the list.
  try {
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      subject: "New Observer subscriber",
      html: `<p>New confirmed subscriber to The Observer: <strong>${escapeHtml(email)}</strong></p>`,
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ status: "ok" });
}
