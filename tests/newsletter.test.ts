import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONFIRM_DAYS,
  confirmationEmail,
  confirmationParams,
  confirmationUrl,
  normaliseEmail,
  signingKey,
  verifyConfirmation,
} from "@/lib/newsletter";
import { broadcastName, editionEmail, formatDate, UNSUBSCRIBE } from "../scripts/observer/email.mjs";
import type { Edition } from "@/lib/observer";

const KEY = "test-key";
const NOW = Date.UTC(2026, 10, 2, 12);

describe("normaliseEmail", () => {
  it("trims and lower-cases", () => {
    expect(normaliseEmail("  Ana@Example.COM ")).toBe("ana@example.com");
  });
  it("refuses what can't be an address", () => {
    for (const bad of ["", "ana", "ana@", "@example.com", "ana@example", "a b@example.com", "<a>@x.com", 42, null]) {
      expect(normaliseEmail(bad)).toBeNull();
    }
    expect(normaliseEmail("a".repeat(250) + "@x.com")).toBeNull();
  });
});

describe("confirmation links", () => {
  const params = confirmationParams("ana@example.com", KEY, NOW);

  it("verify for the address they were made for", () => {
    expect(verifyConfirmation(params, KEY, NOW)).toEqual({ ok: true, email: "ana@example.com" });
  });

  it(`expire after ${CONFIRM_DAYS} days`, () => {
    expect(verifyConfirmation(params, KEY, NOW + (CONFIRM_DAYS - 0.5) * 86400_000).ok).toBe(true);
    expect(verifyConfirmation(params, KEY, NOW + (CONFIRM_DAYS + 0.5) * 86400_000)).toEqual({ ok: false, reason: "expired" });
  });

  it("can't be moved to another address, extended or forged", () => {
    const other = Buffer.from("eve@example.com").toString("base64url");
    expect(verifyConfirmation({ ...params, e: other }, KEY, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyConfirmation({ ...params, x: String(Number(params.x) + 86400) }, KEY, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyConfirmation(params, "another-key", NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyConfirmation({ ...params, t: params.t.slice(0, -2) }, KEY, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(verifyConfirmation({ e: params.e }, KEY, NOW)).toEqual({ ok: false, reason: "invalid" });
  });

  it("an expired forgery is 'invalid', not 'expired'", () => {
    const old = confirmationParams("ana@example.com", "another-key", NOW - 30 * 86400_000);
    expect(verifyConfirmation(old, KEY, NOW)).toEqual({ ok: false, reason: "invalid" });
  });

  it("point at the confirm page in the visitor's language", () => {
    expect(confirmationUrl("ana@example.com", "en", KEY, undefined, NOW)).toMatch(
      /^https:\/\/www\.financeplots\.com\/observer\/confirm\?e=[\w-]+&x=\d+&t=[\w-]+$/,
    );
    expect(confirmationUrl("ana@example.com", "es", KEY, undefined, NOW)).toMatch(/^https:\/\/www\.financeplots\.com\/es\/observer\/confirm\?/);
  });

  it("use NEWSLETTER_SECRET, else a key derived from the Resend key, else none", () => {
    expect(signingKey({ NEWSLETTER_SECRET: "s", RESEND_API_KEY: "r" })).toBe("s");
    expect(signingKey({ RESEND_API_KEY: "r" })).toBe("newsletter:r");
    expect(signingKey({})).toBeNull();
  });
});

describe("confirmation email", () => {
  it("carries the link, in both languages", () => {
    const link = "https://www.financeplots.com/observer/confirm?e=a&x=1&t=b";
    for (const locale of ["en", "es"] as const) {
      const mail = confirmationEmail(locale, link);
      expect(mail.html).toContain(link.replace(/&/g, "&amp;"));
      expect(mail.text).toContain(link);
    }
    expect(confirmationEmail("es", link).subject).toMatch(/Confirma/);
  });
});

describe("edition email", () => {
  const dir = path.join(process.cwd(), "content", "observer");
  const latest = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().at(-1)!;
  const edition: Edition = JSON.parse(fs.readFileSync(path.join(dir, latest), "utf8"));
  const mail = editionEmail(edition);

  it("links to the edition and carries the unsubscribe link in both parts", () => {
    const url = `https://www.financeplots.com/observer/${edition.slug}`;
    expect(mail.html).toContain(url);
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(`href="${UNSUBSCRIBE}"`);
    expect(mail.text).toContain(UNSUBSCRIBE);
    expect(mail.subject).toBe(`The Observer: ${edition.title}`);
  });

  it("says it is not investment advice", () => {
    expect(mail.html).toMatch(/not investment advice/);
    expect(mail.text).toMatch(/not investment advice/);
  });

  it("escapes what the agent wrote", () => {
    const hostile = {
      ...edition,
      title: `<script>alert(1)</script>`,
      regions: edition.regions.map((r) => ({ ...r, headline: `A & B "quoted"` })),
    };
    const html = editionEmail(hostile).html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("A &amp; B &quot;quoted&quot;");
  });

  it("names the broadcast after the edition, so each is sent once", () => {
    expect(broadcastName(edition)).toBe(`observer-${edition.slug}`);
  });

  it("reads dates as calendar dates", () => {
    expect(formatDate("2026-11-02")).toBe("2 November 2026");
    expect(formatDate("2026-01-01")).toBe("1 January 2026");
  });
});
