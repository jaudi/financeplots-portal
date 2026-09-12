import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Sender and recipient are env-configurable so the sending identity can be
// changed from the Vercel dashboard without a deploy — useful while a domain is
// still being verified, since an unverified domain makes Resend reject every
// send from it. Defaults are the production values.
const FROM = process.env.RESEND_FROM ?? "FinancePlots <hello@financeplots.com>";
const NOTIFY_TO = process.env.CONTACT_TO ?? "hello@financeplots.com";

function errorDetail(err: unknown) {
  if (err && typeof err === "object" && "message" in err) return String(err.message);
  return String(err);
}

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Logged before anything can fail, and on its own line, so the address is
  // recoverable from the Vercel logs even when every send below is rejected.
  // Losing the notification is an inconvenience; losing the subscriber is the
  // actual damage, and that is what used to happen — the old route threw the
  // address away with the exception.
  console.log(`[subscribe] new subscriber: ${email}`);

  if (!process.env.RESEND_API_KEY) {
    console.error("[subscribe] RESEND_API_KEY is not set — nothing was sent");
    return NextResponse.json({ error: "Mail is not configured" }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // allSettled, not sequential awaits: these are independent messages to
  // different people. The old route awaited the notification first, so a
  // rejection there meant the subscriber never even got a welcome email —
  // one failure took out both.
  const [notification, welcome] = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: "New subscriber: " + email,
      html: `<p>New subscriber: <strong>${escapeHtml(email)}</strong></p>`,
    }),
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to FinancePlots",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1d4ed8">Welcome to FinancePlots</h2>
          <p>Thanks for subscribing. You'll be the first to know about new tools and financial guides.</p>
          <p>In the meantime, explore our free tools at <a href="https://www.financeplots.com/tools">financeplots.com/tools</a></p>
          <p style="color:#6b7280;font-size:12px">FinancePlots · Not financial advice</p>
        </div>
      `,
    }),
  ]);

  // The SDK reports a refusal in two different shapes: a thrown error, and a
  // resolved response carrying an `error` field. Only checking for the throw
  // reports a rejected send as a success.
  const outcome = (result: PromiseSettledResult<{ error?: unknown } | null>, label: string) => {
    if (result.status === "rejected") {
      console.error(`[subscribe] ${label} threw: ${errorDetail(result.reason)}`);
      return false;
    }
    if (result.value?.error) {
      console.error(`[subscribe] ${label} rejected by Resend: ${JSON.stringify(result.value.error)}`);
      return false;
    }
    return true;
  };

  const notified = outcome(notification, "notification");
  const welcomed = outcome(welcome, "welcome email");

  if (!notified && !welcomed) {
    // Both failed. The address is in the log above, so the lead is not lost,
    // but the visitor should not be told this worked.
    console.error(`[subscribe] BOTH SENDS FAILED for ${email} — recover this address from the log line above`);
    return NextResponse.json({ error: "Could not send the confirmation email" }, { status: 502 });
  }

  if (!notified || !welcomed) {
    console.warn(`[subscribe] partial delivery for ${email} — notified=${notified} welcomed=${welcomed}`);
  }

  return NextResponse.json({ success: true });
}

/** The address is echoed into the notification's HTML, and it arrives from an
 *  anonymous form. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
