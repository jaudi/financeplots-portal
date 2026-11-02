/**
 * The Observer by email: double opt-in without a database.
 *
 * The sign-up form asks for a confirmation email; its link carries the address,
 * an expiry and an HMAC of both, so the confirm step can trust the address
 * without having stored anything. Only a confirmed address reaches the list,
 * which lives in Resend (a segment, `RESEND_SEGMENT_ID`). Each edition is sent
 * to that segment by `scripts/observer/send-newsletter.mjs`.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_URL = "https://www.financeplots.com";

type Env = Record<string, string | undefined>;
/** How long a confirmation link works. */
export const CONFIRM_DAYS = 7;

export type Locale = "en" | "es";

export function toLocale(value: unknown): Locale {
  return value === "es" ? "es" : "en";
}

/** `/es` for Spanish, nothing for English (`localePrefix: "as-needed"`). */
export function localePrefix(locale: Locale): string {
  return locale === "es" ? "/es" : "";
}

/** Trimmed, lower-cased address, or null when it can't be one. */
export function normaliseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  return /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/.test(email) ? email : null;
}

/** The HMAC key. `NEWSLETTER_SECRET` if set; otherwise derived from the Resend key,
 *  so the feature works with the env vars the site already has. */
export function signingKey(env: Env = process.env): string | null {
  return env.NEWSLETTER_SECRET || (env.RESEND_API_KEY ? `newsletter:${env.RESEND_API_KEY}` : null);
}

const b64url = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64url = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function sign(email: string, expires: number, key: string): string {
  return createHmac("sha256", key).update(`observer-confirm:${email}:${expires}`).digest("base64url");
}

export interface ConfirmParams {
  e: string; // base64url address
  x: string; // expiry, Unix seconds
  t: string; // signature
}

export function confirmationParams(email: string, key: string, now = Date.now()): ConfirmParams {
  const expires = Math.floor(now / 1000) + CONFIRM_DAYS * 86400;
  return { e: b64url(email), x: String(expires), t: sign(email, expires, key) };
}

export function confirmationUrl(email: string, locale: Locale, key: string, base = SITE_URL, now = Date.now()): string {
  const url = new URL(`${localePrefix(locale)}/observer/confirm`, base);
  for (const [k, v] of Object.entries(confirmationParams(email, key, now))) url.searchParams.set(k, v);
  return url.toString();
}

export type ConfirmCheck = { ok: true; email: string } | { ok: false; reason: "invalid" | "expired" };

export function verifyConfirmation(params: Partial<Record<keyof ConfirmParams, unknown>>, key: string, now = Date.now()): ConfirmCheck {
  const { e, x, t } = params;
  if (typeof e !== "string" || typeof x !== "string" || typeof t !== "string") return { ok: false, reason: "invalid" };
  const email = normaliseEmail(unb64url(e));
  const expires = Number(x);
  if (!email || !/^\d{1,12}$/.test(x)) return { ok: false, reason: "invalid" };
  const expected = Buffer.from(sign(email, expires, key));
  const given = Buffer.from(t);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "invalid" };
  // Checked after the signature, so "expired" is only ever said of a genuine link.
  if (expires * 1000 < now) return { ok: false, reason: "expired" };
  return { ok: true, email };
}

/** Where confirmation links point: the live site, or this deployment on a Vercel preview. */
export function siteBase(env: Env = process.env): string {
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return SITE_URL;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CONFIRM_COPY = {
  en: {
    subject: "Confirm your subscription to The Observer",
    heading: "One click to confirm",
    intro: "Someone — hopefully you — asked to get The Observer, FinancePlots' weekly read on the world economy, at this address.",
    button: "Yes, send me The Observer",
    after: "One email each Monday, when the new edition is published. Every email has a one-click unsubscribe link.",
    ignore: `Didn't ask for this? Ignore this email and nothing will be sent. The link stops working after ${CONFIRM_DAYS} days.`,
    footer: "FinancePlots · General commentary, not investment advice",
  },
  es: {
    subject: "Confirma tu suscripción a The Observer",
    heading: "Un clic para confirmar",
    intro: "Alguien — esperamos que tú — ha pedido recibir en esta dirección The Observer, la lectura semanal de FinancePlots sobre la economía mundial (en inglés).",
    button: "Sí, enviadme The Observer",
    after: "Un email cada lunes, cuando se publica la nueva edición. Cada email lleva un enlace para darte de baja con un clic.",
    ignore: `¿No lo has pedido tú? Ignora este email y no se enviará nada. El enlace caduca a los ${CONFIRM_DAYS} días.`,
    footer: "FinancePlots · Comentario general, no asesoramiento de inversión",
  },
} as const;

export function confirmationEmail(locale: Locale, link: string): { subject: string; html: string; text: string } {
  const c = CONFIRM_COPY[locale];
  const href = escapeHtml(link);
  const html = `<!doctype html><html><body style="margin:0;background:#f3f4f6">
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111827">
  <p style="margin:0 0 4px;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">The Observer</p>
  <h1 style="margin:0 0 16px;font-size:24px">${escapeHtml(c.heading)}</h1>
  <p style="line-height:1.6">${escapeHtml(c.intro)}</p>
  <p style="margin:28px 0"><a href="${href}" style="background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block">${escapeHtml(c.button)}</a></p>
  <p style="line-height:1.6;color:#374151">${escapeHtml(c.after)}</p>
  <p style="line-height:1.6;color:#6b7280;font-size:13px">${escapeHtml(c.ignore)}</p>
  <p style="margin-top:32px;color:#9ca3af;font-size:12px">${escapeHtml(c.footer)}</p>
</div></body></html>`;
  const text = `${c.heading}\n\n${c.intro}\n\n${c.button}:\n${link}\n\n${c.after}\n\n${c.ignore}\n\n${c.footer}\n`;
  return { subject: c.subject, html, text };
}
