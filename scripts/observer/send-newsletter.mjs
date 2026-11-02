/**
 * Emails one edition of The Observer to its subscribers, as a Resend Broadcast to
 * the segment confirmed sign-ups join (lib/newsletter.ts, /api/subscribe/confirm).
 *
 *   node scripts/observer/send-newsletter.mjs [slug] [--dry-run] [--force] [--no-wait] [--hold-until HH:MM]
 *
 * - No slug: the newest edition in content/observer/.
 * - Sends each edition once: a broadcast named `observer-<slug>` that is already
 *   sent or queued means there is nothing to do, so the workflow can run on every
 *   push and on a schedule without anyone getting it twice.
 * - Never sends an old edition by accident: one dated more than MAX_AGE_DAYS ago is
 *   skipped unless --force.
 * - --hold-until 07:30 (the scheduled runs): nothing goes out before that London time on
 *   the edition's own date, so an edition that published itself overnight can be read
 *   and reverted before it reaches inboxes. A revert removes the file, and the newest
 *   edition left is a week old, so nothing is sent.
 * - Waits until the edition's page is live before sending (the email links to it),
 *   up to WAIT_MINUTES; --no-wait skips that.
 * - --dry-run writes the email to $NEWSLETTER_PREVIEW_DIR (default: the OS temp dir)
 *   and sends nothing; it needs no keys.
 *
 * Needs RESEND_API_KEY and RESEND_SEGMENT_ID (RESEND_AUDIENCE_ID also accepted).
 * Without them it warns and exits 0, so the workflow stays green until they are set.
 * Talks to Resend's REST API with fetch, so the workflow installs nothing.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { broadcastName, editionEmail, editionUrl, isHeld, londonClock, SITE_URL } from "./email.mjs";

const MAX_AGE_DAYS = 6;
const WAIT_MINUTES = 20;
const API = "https://api.resend.com";
const FROM = process.env.NEWSLETTER_FROM || "The Observer · FinancePlots <hello@financeplots.com>";
const REPLY_TO = process.env.CONTACT_TO || "hello@financeplots.com";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const holdIdx = args.indexOf("--hold-until");
const holdUntil = holdIdx >= 0 ? args[holdIdx + 1] : null;
if (holdUntil !== null && !/^\d{2}:\d{2}$/.test(holdUntil ?? "")) throw new Error("--hold-until takes HH:MM");
const slugArg = args.find((a, i) => !a.startsWith("--") && (holdIdx < 0 || i !== holdIdx + 1));
const DIR = path.join(process.cwd(), "content", "observer");

const log = (...m) => console.log("[newsletter]", ...m);
const warn = (m) => console.log(`::warning::${m}`);
const summary = (m) => process.env.GITHUB_STEP_SUMMARY && fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, m + "\n");

function pickEdition() {
  const slugs = fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
  const slug = slugArg ?? slugs.at(-1);
  if (!slug || !slugs.includes(slug)) throw new Error(`No edition ${slug ?? "found"} in content/observer`);
  return JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.json`), "utf8"));
}

async function resend(method, route, body) {
  const res = await fetch(API + route, {
    method,
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${method} ${route}: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function findBroadcast(name) {
  let after;
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({ limit: "100", ...(after && { after }) });
    const { data = [], has_more } = await resend("GET", `/broadcasts?${q}`);
    const hit = data.find((b) => b.name === name);
    if (hit) return hit;
    if (!has_more || !data.length) return null;
    after = data.at(-1).id;
  }
  return null;
}

async function waitUntilLive(url) {
  const deadline = Date.now() + WAIT_MINUTES * 60_000;
  for (;;) {
    const status = await fetch(url, { redirect: "follow" }).then((r) => r.status, () => 0);
    if (status === 200) return;
    if (Date.now() > deadline) throw new Error(`${url} still answers ${status} after ${WAIT_MINUTES} min — not sending`);
    log(`waiting for ${url} (${status || "no answer"})`);
    await new Promise((r) => setTimeout(r, 30_000));
  }
}

const edition = pickEdition();
const name = broadcastName(edition);
const ageDays = (Date.now() - Date.parse(`${edition.date}T00:00:00Z`)) / 86_400_000;
log(`edition ${edition.slug}: ${edition.title}`);

if (ageDays > MAX_AGE_DAYS && !flag("--force")) {
  log(`dated ${Math.floor(ageDays)} days ago — older than ${MAX_AGE_DAYS}, not sending (use --force to send it anyway)`);
  process.exit(0);
}

if (holdUntil && isHeld(edition.date, holdUntil) && !flag("--dry-run")) {
  const now = londonClock();
  log(`held until ${holdUntil} London time on ${edition.date} (it is ${now.time} on ${now.date}) — a later run will send it`);
  process.exit(0);
}

const email = editionEmail(edition, { site: SITE_URL });

if (flag("--dry-run")) {
  const dir = process.env.NEWSLETTER_PREVIEW_DIR || os.tmpdir();
  const base = path.join(dir, name);
  fs.writeFileSync(`${base}.html`, email.html);
  fs.writeFileSync(`${base}.txt`, email.text);
  log(`dry run — subject: ${email.subject}`);
  log(`wrote ${base}.html and ${base}.txt; nothing sent`);
  summary(`Dry run: **${email.subject}** — nothing sent.`);
  process.exit(0);
}

const segmentId = process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID;
if (!process.env.RESEND_API_KEY || !segmentId) {
  warn("RESEND_API_KEY or RESEND_SEGMENT_ID is not set as a GitHub Actions secret — The Observer was not emailed.");
  process.exit(0);
}

const existing = await findBroadcast(name);
if (existing && existing.status !== "draft") {
  log(`already ${existing.status} as broadcast ${existing.id} — nothing to do`);
  process.exit(0);
}
if (existing) {
  // A draft left by a run that failed half-way; the edition may have changed since.
  log(`removing leftover draft ${existing.id}`);
  await resend("DELETE", `/broadcasts/${existing.id}`);
}

if (!flag("--no-wait")) await waitUntilLive(editionUrl(edition, SITE_URL));

const created = await resend("POST", "/broadcasts", {
  name,
  segment_id: segmentId,
  from: FROM,
  reply_to: REPLY_TO,
  subject: email.subject,
  preview_text: email.previewText,
  html: email.html,
  text: email.text,
  send: true,
});
log(`sent as broadcast ${created.id}`);
summary(`Emailed **${email.subject}** to the Observer segment (broadcast \`${created.id}\`).`);
