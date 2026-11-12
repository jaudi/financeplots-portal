// "Was this tool useful?" votes (components/ToolFeedback.tsx, /api/feedback).
//
// Stored in Upstash Redis (free plan, connected through the Vercel
// Marketplace): one hash per tool, `feedback:tool:<slug>` with fields `up` and
// `down`. Only the two counts are kept — no IP, no cookie, nothing typed. A
// visitor's own vote lives in their browser (localStorage), which is what stops
// a second vote; the counts are a rough signal, not an audited poll.
//
// Without the Redis env vars the API answers `enabled: false` and the widget
// renders nothing, so the site works the same before the store is connected.

import { AUDIENCE_KEYS, STOCK_TOOLS, audienceSlugs } from "@/lib/audiences";

export type Vote = "up" | "down";
export interface Counts { up: number; down: number }

/** Every tool a vote can be for: the slugs in the menus plus the Stocks area's own tools. */
export const FEEDBACK_TOOLS: ReadonlySet<string> = new Set([
  ...AUDIENCE_KEYS.flatMap((a) => audienceSlugs(a)),
  ...STOCK_TOOLS,
]);

export const isVote = (v: unknown): v is Vote => v === "up" || v === "down";
export const isFeedbackTool = (t: unknown): t is string => typeof t === "string" && FEEDBACK_TOOLS.has(t);

/** The Vercel Marketplace integration names them KV_REST_API_*; Upstash's own docs, UPSTASH_REDIS_REST_*. */
function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export const feedbackEnabled = () => redisConfig() !== null;

const key = (tool: string) => `feedback:tool:${tool}`;

/** Runs Redis commands in one round trip (Upstash REST pipeline). */
async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
  const cfg = redisConfig();
  if (!cfg) throw new Error("feedback store not configured");
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`feedback store answered ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return out.map((r) => r.result);
}

/** HGETALL's flat [field, value, …] reply → counts, never below zero. */
export function parseCounts(reply: unknown): Counts {
  const flat = Array.isArray(reply) ? reply : [];
  const read = (field: Vote) => {
    const i = flat.indexOf(field);
    const n = i >= 0 ? Number(flat[i + 1]) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  };
  return { up: read("up"), down: read("down") };
}

export async function getCounts(tool: string): Promise<Counts> {
  const [reply] = await pipeline([["HGETALL", key(tool)]]);
  return parseCounts(reply);
}

/** Adds a vote; with `previous` (the visitor's earlier, different vote) it moves it instead. */
export async function castVote(tool: string, vote: Vote, previous?: Vote): Promise<Counts> {
  const commands: (string | number)[][] = [];
  if (previous !== vote) commands.push(["HINCRBY", key(tool), vote, 1]);
  if (previous && previous !== vote) commands.push(["HINCRBY", key(tool), previous, -1]);
  commands.push(["HGETALL", key(tool)]);
  const replies = await pipeline(commands);
  return parseCounts(replies[replies.length - 1]);
}
