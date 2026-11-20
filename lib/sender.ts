/**
 * The blog's mailing list lives in Sender (sender.net); The Observer's in Resend.
 * One sign-up on the site covers both: when someone confirms (the double opt-in in
 * lib/newsletter.ts), /api/subscribe/confirm puts the address in the Resend segment
 * and, through this, in the Sender group the blog emails go to.
 *
 * Needs SENDER_API_TOKEN (Sender → Settings → API access tokens) and
 * SENDER_GROUP_ID (the group's id, e.g. from GET /v2/groups). Without them it
 * does nothing and says so.
 */

const API = "https://api.sender.net/v2";

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export type SenderResult =
  | { status: "added" } // already in Sender, now in the group
  | { status: "created" } // new in Sender, created in the group
  | { status: "skipped"; reason: string } // not configured
  | { status: "failed"; reason: string };

export function senderConfig(env: Env = process.env): { token: string; groupId: string } | null {
  const token = env.SENDER_API_TOKEN?.trim();
  const groupId = env.SENDER_GROUP_ID?.trim();
  return token && groupId ? { token, groupId } : null;
}

/** Puts a confirmed address in the blog's Sender group. Never throws. */
export async function addToSenderGroup(email: string, env: Env = process.env, fetchImpl: Fetch = fetch): Promise<SenderResult> {
  const config = senderConfig(env);
  if (!config) return { status: "skipped", reason: "SENDER_API_TOKEN or SENDER_GROUP_ID is not set" };
  const headers = {
    Authorization: `Bearer ${config.token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const call = async (path: string, body: unknown) => {
    const res = await fetchImpl(`${API}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, data };
  };

  try {
    // Someone already in Sender (an earlier blog sign-up): add them to the group.
    // Sender answers 200 either way and lists unknown addresses separately.
    const grouped = await call(`/subscribers/groups/${encodeURIComponent(config.groupId)}`, { subscribers: [email] });
    if (!grouped.ok) return { status: "failed", reason: `group add ${grouped.status} ${JSON.stringify(grouped.data)}` };
    const message = (grouped.data.message ?? {}) as { non_existing_subscribers?: unknown };
    const unknown = Array.isArray(message.non_existing_subscribers) && message.non_existing_subscribers.includes(email);
    if (!unknown) return { status: "added" };

    // New to Sender: create them straight into the group.
    const created = await call("/subscribers", { email, groups: [config.groupId] });
    if (!created.ok) return { status: "failed", reason: `create ${created.status} ${JSON.stringify(created.data)}` };
    return { status: "created" };
  } catch (err) {
    return { status: "failed", reason: err instanceof Error ? err.message : String(err) };
  }
}
