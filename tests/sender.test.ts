import { describe, expect, it } from "vitest";
import { addToSenderGroup, senderConfig } from "@/lib/sender";

const env = { SENDER_API_TOKEN: "tok", SENDER_GROUP_ID: "grp1" };

/** A fake fetch that answers each call in turn and records what was sent. */
function fakeFetch(...answers: { status: number; body: unknown }[]) {
  const calls: { url: string; body: unknown; auth: string }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)), auth: (init.headers as Record<string, string>).Authorization });
    const a = answers.shift() ?? { status: 500, body: {} };
    return new Response(JSON.stringify(a.body), { status: a.status });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe("Sender (blog list)", () => {
  it("does nothing without its env vars", async () => {
    expect(senderConfig({})).toBeNull();
    const { impl, calls } = fakeFetch();
    expect(await addToSenderGroup("a@b.co", {}, impl)).toMatchObject({ status: "skipped" });
    expect(calls).toHaveLength(0);
  });

  it("adds someone already in Sender to the group", async () => {
    const { impl, calls } = fakeFetch({ status: 200, body: { success: true, message: { subscribers_added_to_group: ["a@b.co"], non_existing_subscribers: [] } } });
    expect(await addToSenderGroup("a@b.co", env, impl)).toEqual({ status: "added" });
    expect(calls).toEqual([{ url: "https://api.sender.net/v2/subscribers/groups/grp1", body: { subscribers: ["a@b.co"] }, auth: "Bearer tok" }]);
  });

  it("creates someone new straight into the group", async () => {
    const { impl, calls } = fakeFetch(
      { status: 200, body: { success: true, message: { subscribers_added_to_group: [], non_existing_subscribers: ["a@b.co"] } } },
      { status: 200, body: { success: true, data: { id: "x" } } },
    );
    expect(await addToSenderGroup("a@b.co", env, impl)).toEqual({ status: "created" });
    expect(calls[1]).toEqual({ url: "https://api.sender.net/v2/subscribers", body: { email: "a@b.co", groups: ["grp1"] }, auth: "Bearer tok" });
  });

  it("reports a failure instead of throwing", async () => {
    const { impl } = fakeFetch({ status: 401, body: { message: "Unauthenticated." } });
    const r = await addToSenderGroup("a@b.co", env, impl);
    expect(r.status).toBe("failed");
    const boom = (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    expect(await addToSenderGroup("a@b.co", env, boom)).toEqual({ status: "failed", reason: "network down" });
  });
});
