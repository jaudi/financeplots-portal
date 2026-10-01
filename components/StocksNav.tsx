"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// One tab bar across the four stock tools, so they read as one Stocks area.
// The tools keep their own URLs (shared links, blog posts and the MCP's
// tool_page point at them); switching tab carries the tickers already on
// screen, read from the URL each tool keeps up to date:
//   ?symbol=AAPL  ·  ?symbols=AAPL,MSFT  ·  ?h=AAPL:60,MSFT:40
// Nothing is ever suggested: with no tickers on screen, a tab opens empty.

export type StocksTab = "analysis" | "compare" | "portfolio" | "screen";

const TABS: { key: StocksTab; path: string; icon: string; label: string; hint: string }[] = [
  { key: "analysis", path: "/tools/stock-analysis", icon: "📈", label: "Price history", hint: "One stock, index or currency" },
  { key: "compare", path: "/tools/stock-comparison", icon: "📉", label: "Compare", hint: "Up to four, side by side" },
  { key: "portfolio", path: "/tools/portfolio-analysis", icon: "📊", label: "Portfolio", hint: "Weights, risk and return" },
  { key: "screen", path: "/tools/stock-screener", icon: "🔎", label: "Screener", hint: "Filter an index by measures you set" },
];

const MAX_COMPARE = 4;
const MAX_PORTFOLIO = 8;

/** Tickers currently on screen, in the order the visitor typed them. */
export function tickersFromParams(p: URLSearchParams): string[] {
  const raw = p.get("symbol") ?? p.get("symbols") ?? (p.get("h") ?? "").split(",").map((pair) => pair.split(":")[0]).join(",");
  return [...new Set(raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))];
}

/** Where a tab leads, carrying the tickers (and the period, if any) across. */
export function tabHref(tab: StocksTab, tickers: string[], range: string | null): string {
  const path = TABS.find((t) => t.key === tab)!.path;
  const q = new URLSearchParams();
  if (tab === "analysis" && tickers.length) q.set("symbol", tickers[0]);
  if (tab === "compare" && tickers.length) q.set("symbols", tickers.slice(0, MAX_COMPARE).join(","));
  // Equal weights: the visitor sets their own on the next screen.
  if (tab === "portfolio" && tickers.length) q.set("h", tickers.slice(0, MAX_PORTFOLIO).map((t) => `${t}:1`).join(","));
  // Each page validates the period and falls back to one year if it doesn't offer it.
  if (tab !== "screen" && q.size > 0 && range) q.set("range", range);
  const query = q.toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
  return query ? `${path}?${query}` : path;
}

export default function StocksNav({ current }: { current: StocksTab | "hub" }) {
  const router = useRouter();

  const go = (e: React.MouseEvent, tab: StocksTab) => {
    // Plain clicks carry the tickers; modified clicks (new tab) keep the bare link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    // A company page (/tools/stocks/AAPL) carries its ticker in the path.
    const onCompany = window.location.pathname.match(/\/tools\/stocks\/([^/]+)$/);
    if (onCompany && !params.has("symbol")) params.set("symbol", decodeURIComponent(onCompany[1]));
    const locale = window.location.pathname.startsWith("/es/") || window.location.pathname === "/es" ? "/es" : "";
    router.push(locale + tabHref(tab, tickersFromParams(params), params.get("range")));
  };

  return (
    <nav aria-label="Stocks" className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <Link href="/tools/stocks" className="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition">
          Stocks
        </Link>
        <Link href="/tools/personal" className="text-gray-500 hover:text-white text-xs transition">← Individuals</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TABS.map((t) => {
          const active = t.key === current;
          return (
            <Link
              key={t.key}
              href={t.path}
              onClick={(e) => go(e, t.key)}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl px-3 py-2.5 border transition ${
                active
                  ? "bg-blue-600/15 border-blue-500 text-white"
                  : "bg-[#0d1426] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <span className="block text-sm font-semibold">
                <span className="mr-1.5" aria-hidden>{t.icon}</span>
                {t.label}
              </span>
              <span className="block text-[11px] text-gray-500 truncate">{t.hint}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
