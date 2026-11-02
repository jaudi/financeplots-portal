/**
 * The Observer as an email: subject, preview text, HTML and plain text for one edition.
 *
 * A digest, not the whole piece — headline, dek, market mood, the three regions and
 * next week's calendar, then a link to the full edition (and its audio) on the site.
 * The article's dozens of inline links stay on the page. Plain JS so both the send
 * script (Node, no build step) and the Vitest suite can import it.
 *
 * `{{{RESEND_UNSUBSCRIBE_URL}}}` is filled in per recipient by Resend Broadcasts,
 * which also records the unsubscribe.
 */

export const SITE_URL = "https://www.financeplots.com";
export const UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";

const REGION_NAMES = { US: "United States", Euro: "Euro area", Asia: "Asia" };

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "2026-11-02" → "2 November 2026", read as a calendar date (no time zone shift). */
export function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  return `${d} ${month} ${y}`;
}

export function editionUrl(edition, site = SITE_URL) {
  return `${site}/observer/${edition.slug}`;
}

export function broadcastName(edition) {
  return `observer-${edition.slug}`;
}

export function editionEmail(edition, { site = SITE_URL } = {}) {
  const url = editionUrl(edition, site);
  const date = formatDate(edition.date);
  const minutes = edition.audio ? Math.max(1, Math.round(edition.audio.durationSeconds / 60)) : null;
  const e = escapeHtml;

  const regionsHtml = edition.regions
    .map(
      (r) => `
    <tr><td style="padding:14px 0;border-top:1px solid #e5e7eb">
      <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${e(REGION_NAMES[r.region] ?? r.region)}</p>
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827">${e(r.headline)}</p>
      <p style="margin:0;line-height:1.6;color:#374151">${e(r.summary)}</p>
    </td></tr>`,
    )
    .join("");

  const watchHtml = edition.watchNextWeek.length
    ? `
  <p style="margin:28px 0 8px;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">On the calendar next week</p>
  <ul style="margin:0;padding-left:20px;line-height:1.7;color:#374151">${edition.watchNextWeek.map((w) => `<li>${e(w)}</li>`).join("")}</ul>`
    : "";

  const audioHtml = minutes
    ? ` &nbsp;·&nbsp; <a href="${e(url)}" style="color:#1d4ed8;white-space:nowrap">🎧 Listen (${minutes} min)</a>`
    : "";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(edition.title)}</title></head>
<body style="margin:0;background:#f3f4f6">
<span style="display:none;max-height:0;overflow:hidden">${e(edition.dek)}</span>
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#111827;background:#ffffff">
  <p style="margin:0 0 6px;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">The Observer · Week of ${e(date)}</p>
  <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25">${e(edition.title)}</h1>
  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#4b5563">${e(edition.dek)}</p>
  <p style="margin:0 0 24px"><a href="${e(url)}" style="background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:10px;display:inline-block">Read the full edition</a>${audioHtml}</p>

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:0 0 8px">
    <p style="margin:0 0 4px;font-size:13px;color:#6b7280">Market mood: <strong style="color:#111827">${e(edition.mood.label)}</strong></p>
    <p style="margin:0;line-height:1.6;color:#374151;font-size:14px">${e(edition.mood.explanation)}</p>
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${regionsHtml}
  </table>
${watchHtml}
  <p style="margin:28px 0 0"><a href="${e(url)}" style="color:#1d4ed8;font-weight:700">Read the full edition, with sources and data →</a></p>

  <p style="margin:36px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.6">
    Written by an AI agent from public data and news. General commentary, not investment advice or a recommendation to buy or sell anything.<br>
    You are getting this because you subscribed at financeplots.com. <a href="${UNSUBSCRIBE}" style="color:#6b7280">Unsubscribe</a>
  </p>
</div>
</body></html>`;

  const text = [
    `THE OBSERVER · Week of ${date}`,
    "",
    edition.title,
    "",
    edition.dek,
    "",
    `Read the full edition${minutes ? ` (or listen, ${minutes} min)` : ""}: ${url}`,
    "",
    `Market mood: ${edition.mood.label}`,
    edition.mood.explanation,
    "",
    ...edition.regions.flatMap((r) => [`${(REGION_NAMES[r.region] ?? r.region).toUpperCase()}: ${r.headline}`, r.summary, ""]),
    ...(edition.watchNextWeek.length ? ["ON THE CALENDAR NEXT WEEK", ...edition.watchNextWeek.map((w) => `- ${w}`), ""] : []),
    "Written by an AI agent from public data and news. General commentary, not investment advice or a recommendation to buy or sell anything.",
    `Unsubscribe: ${UNSUBSCRIBE}`,
    "",
  ].join("\n");

  return {
    subject: `The Observer: ${edition.title}`,
    previewText: edition.dek,
    html,
    text,
  };
}

/** The date ("2026-11-02") and time ("07:41") in London at `now`, whatever the season. */
export function londonClock(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/**
 * True while an edition should not be emailed yet: before `holdUntil` ("07:30",
 * London time) on the edition's own date. An edition that published itself
 * overnight then sits on the site for the morning, so a mistake can be reverted
 * before it reaches anyone's inbox.
 */
export function isHeld(editionDate, holdUntil, now = new Date()) {
  const { date, time } = londonClock(now);
  return date < editionDate || (date === editionDate && time < holdUntil);
}
