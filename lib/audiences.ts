// The site's tools are split by who they are for: individuals planning their
// own money, and companies. Each audience has its own hub (/tools/personal,
// /tools/business) and its own menu. Copy lives in the `audiences` and
// `tools.catalog` message namespaces.
//
// A tool may appear in both audiences (the Stocks area), but each planner
// belongs to exactly one — the two journeys are deliberately kept apart.

export type Audience = "personal" | "business";

export interface ToolGroup {
  key: string;
  icon: string;
  slugs: string[];
}

export const AUDIENCES: Record<Audience, { href: string; icon: string; planner: string; groups: ToolGroup[] }> = {
  personal: {
    href: "/tools/personal",
    icon: "👤",
    planner: "financial-planner",
    groups: [
      { key: "plan", icon: "💸", slugs: ["take-home-pay", "personal-budget", "compound-interest", "investment-return", "lending"] },
      { key: "invest", icon: "📈", slugs: ["stocks"] },
    ],
  },
  business: {
    href: "/tools/business",
    icon: "🏢",
    planner: "financial-planner-company",
    groups: [
      { key: "plan", icon: "🧮", slugs: ["annual-budget", "cash-flow", "break-even", "financial-model", "valuation"] },
      { key: "context", icon: "📡", slugs: ["macro-dashboard", "stocks"] },
      { key: "funding", icon: "🎯", slugs: ["pitch-deck"] },
    ],
  },
};

export const AUDIENCE_KEYS = Object.keys(AUDIENCES) as Audience[];

/** The tools inside the Stocks area (its tab bar, components/StocksNav.tsx).
 *  The menus list the area once, as "stocks"; counting tools counts these. */
export const STOCK_TOOLS = ["stock-analysis", "stock-comparison", "portfolio-analysis", "stock-screener"];

/** How many distinct tools the site has: a tool in both audiences counts once,
 *  and the Stocks area counts as the tools in it, not as one. */
export function toolCount(): number {
  const slugs = AUDIENCE_KEYS.flatMap((a) => audienceSlugs(a)).flatMap((s) => (s === "stocks" ? STOCK_TOOLS : [s]));
  return new Set(slugs).size;
}

/** Every tool slug of an audience, planner first. */
export function audienceSlugs(audience: Audience): string[] {
  const a = AUDIENCES[audience];
  return [a.planner, ...a.groups.flatMap(g => g.slugs)];
}

export interface CatalogEntry {
  icon: string;
  name: string;
  desc: string;
}
