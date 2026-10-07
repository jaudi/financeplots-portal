import { track } from "@vercel/analytics";

// Custom events for Vercel Web Analytics, so we can see which tools people
// finish with (an export, a chat, a shared link), not only which they open.
// Browser only. Every event carries the page it came from, so a call site
// names just what happened.
//
// Privacy, as promised on the site: no figures, names, tickers or anything
// typed ever goes into an event — only which tool, and what kind of action.

export type AppEvent =
  | "export" // a PDF, PPTX, XLSX or CSV downloaded
  | "template" // an Excel input template downloaded
  | "import" // a spreadsheet imported into a tool
  | "chat_done" // a guided chat answered to the end
  | "finder_result" // "Which tool do I need?" pointed somewhere
  | "share_link" // a link to the figures on screen copied
  | "connector_copy" // the MCP URL or Claude Code command copied on /mcp
  | "email_signup"
  | "contact_click";

type Props = Record<string, string | number | boolean>;

/** `/es/tools/stocks/SAN.MC` → `/tools/stocks/[ticker]`: one row per tool, never per company. */
export function pageOf(pathname: string): string {
  const p = pathname.replace(/^\/es(?=\/|$)/, "") || "/";
  return p.replace(/^\/tools\/stocks\/[^/]+$/, "/tools/stocks/[ticker]");
}

export function trackEvent(name: AppEvent, props: Props = {}) {
  try {
    if (typeof window === "undefined") return;
    const { pathname } = window.location;
    track(name, { page: pageOf(pathname), locale: /^\/es(\/|$)/.test(pathname) ? "es" : "en", ...props });
  } catch {
    // Analytics must never break a tool.
  }
}
