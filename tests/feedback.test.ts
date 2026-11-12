import { afterEach, describe, expect, it, vi } from "vitest";
import { castVote, FEEDBACK_TOOLS, feedbackEnabled, isFeedbackTool, isVote, parseCounts } from "@/lib/feedback";
import { GET, POST } from "@/app/api/feedback/route";

const ENV = ["KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function connect() {
  vi.stubEnv("KV_REST_API_URL", "https://redis.example/");
  vi.stubEnv("KV_REST_API_TOKEN", "test-token");
}

/** A fake Upstash pipeline endpoint over an in-memory hash. */
function fakeRedis() {
  const store = new Map<string, Record<string, number>>();
  const calls: unknown[][][] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
    const commands = JSON.parse(String(init?.body)) as unknown[][];
    calls.push(commands);
    const results = commands.map(([cmd, key, field, by]) => {
      const h = store.get(String(key)) ?? {};
      store.set(String(key), h);
      if (cmd === "HINCRBY") return { result: (h[String(field)] = (h[String(field)] ?? 0) + Number(by)) };
      return { result: Object.entries(h).flatMap(([f, v]) => [f, String(v)]) };
    });
    return new Response(JSON.stringify(results));
  });
  return { store, calls };
}

describe("feedback store", () => {
  it("knows every tool, including the Stocks area's own and the new ones", () => {
    for (const t of ["lending", "cap-table", "pitch-deck", "stocks", "stock-screener", "financial-planner"]) expect(FEEDBACK_TOOLS.has(t)).toBe(true);
    expect(isFeedbackTool("../etc")).toBe(false);
    expect(isVote("up") && isVote("down") && !isVote("meh")).toBe(true);
  });

  it("reads HGETALL replies, missing fields as 0", () => {
    expect(parseCounts(["up", "3", "down", "1"])).toEqual({ up: 3, down: 1 });
    expect(parseCounts(["down", "2"])).toEqual({ up: 0, down: 2 });
    expect(parseCounts(null)).toEqual({ up: 0, down: 0 });
    expect(parseCounts(["up", "-1"])).toEqual({ up: 0, down: 0 });
  });

  it("is off without the Redis env vars", () => {
    for (const k of ENV) vi.stubEnv(k, "");
    expect(feedbackEnabled()).toBe(false);
  });

  it("counts a vote, and moves it when the visitor changes their mind", async () => {
    connect();
    const { calls } = fakeRedis();
    expect(await castVote("lending", "up")).toEqual({ up: 1, down: 0 });
    expect(await castVote("lending", "down", "up")).toEqual({ up: 0, down: 1 });
    expect(await castVote("lending", "down", "down")).toEqual({ up: 0, down: 1 }); // same vote again: nothing added
    expect(calls[0][0]).toEqual(["HINCRBY", "feedback:tool:lending", "up", 1]);
  });
});

describe("/api/feedback", () => {
  it("tells the widget to stay hidden when the store isn't connected", async () => {
    for (const k of ENV) vi.stubEnv(k, "");
    const res = await GET(new Request("http://x/api/feedback?tool=lending"));
    expect(await res.json()).toEqual({ enabled: false });
  });

  it("only touches Redis for counts when asked, and rejects unknown tools and votes", async () => {
    connect();
    const { calls } = fakeRedis();
    expect(await (await GET(new Request("http://x/api/feedback?tool=lending"))).json()).toEqual({ enabled: true });
    expect(calls).toHaveLength(0);
    expect((await GET(new Request("http://x/api/feedback?tool=nope"))).status).toBe(400);

    const post = (body: unknown) => POST(new Request("http://x/api/feedback", { method: "POST", body: JSON.stringify(body) }));
    expect(await (await post({ tool: "cap-table", vote: "up" })).json()).toEqual({ enabled: true, up: 1, down: 0 });
    expect((await post({ tool: "cap-table", vote: "maybe" })).status).toBe(400);
    expect((await post({ tool: "admin", vote: "up" })).status).toBe(400);
    expect(await (await GET(new Request("http://x/api/feedback?tool=cap-table&counts=1"))).json()).toEqual({ enabled: true, up: 1, down: 0 });
  });
});
