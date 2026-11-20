import { TAX_YEAR } from "@/lib/calculators";
import { mortgagePath } from "@/lib/mortgage-pages";
import { BASE } from "@/lib/page-metadata";
import { gbp, salaryPath } from "@/lib/salary-pages";

// Embeddable cards (/embed/salary/45000, /embed/mortgage/200000) and the code
// a blogger pastes to show one. The code is an iframe plus a plain link under
// it: search engines don't credit a site for links inside someone else's
// iframe, so the visible <a> is what makes an embed a link back to us.
// Links inside the card carry utm_source=embed, so clicks from embeds show up
// in Vercel Analytics (utmSource) — the embed pages themselves load no analytics.

export interface EmbedInfo {
  /** The card, for the iframe. */
  src: string;
  /** The full page the card comes from. */
  pageUrl: string;
  /** iframe title (screen readers) and the link text under it. */
  title: string;
  height: number;
}

/** Tall enough for the card at any width down to 300px (checked in the preview). */
export const EMBED_HEIGHT = 380;
export const EMBED_MAX_WIDTH = 640;
export const EMBED_UTM = "utm_source=embed&utm_medium=iframe";

export function salaryEmbed(salary: number): EmbedInfo {
  return {
    src: `${BASE}/embed/salary/${salary}`,
    pageUrl: `${BASE}${salaryPath(salary)}`,
    title: `${gbp(salary)} after tax in ${TAX_YEAR}`,
    height: EMBED_HEIGHT,
  };
}

export function mortgageEmbed(amount: number): EmbedInfo {
  return {
    src: `${BASE}/embed/mortgage/${amount}`,
    pageUrl: `${BASE}${mortgagePath(amount)}`,
    title: `${gbp(amount)} mortgage monthly payments`,
    height: EMBED_HEIGHT,
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The HTML to paste: the card, then a visible credit link to the full page. */
export function embedSnippet(e: EmbedInfo): string {
  return [
    `<iframe src="${e.src}" title="${esc(e.title)} — FinancePlots" width="100%" height="${e.height}" style="border:0;max-width:${EMBED_MAX_WIDTH}px" loading="lazy"></iframe>`,
    `<p style="font-size:13px;margin:4px 0 0"><a href="${e.pageUrl}">${esc(e.title)}</a> · FinancePlots</p>`,
  ].join("\n");
}

/** A link inside a card, tagged so clicks from embeds can be counted. */
export const withUtm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}${EMBED_UTM}`;
